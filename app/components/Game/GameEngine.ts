import { useGameStore } from "../../store/useGameStore";

// ─── 常數設定 ────────────────────────────────
const BOSS_INTERVAL_MS     = 120_000;  // 每 2 分鐘一隻 Boss
const BOSS_WARNING_MS      = 10_000;   // 出現前 10 秒警告
const BOSS_BASE_HP         = 500;      // Boss 基底血量
const BOSS_HP_SCALE        = 200;      // 每隻 Boss 額外增加的血量
const BOSS_BASE_SPEED      = 0.8;      // Boss 移動速度（略慢）
const BOSS_SPEED_SCALE     = 0.05;     // 每隻 Boss 速度成長
const BOSS_SIZE            = 60;       // Boss 體型
const BOSS_CONTACT_DAMAGE  = 20;       // 碰撞傷害
const BOSS_BULLET_DAMAGE   = 12;       // Boss 子彈傷害
const BOSS_FIRE_INTERVAL   = 800;      // Boss 射速 ms（每 0.8 秒一輪）
const BOSS_BULLET_COUNT    = 8;        // Boss 每次射出的子彈數（全方向）
const BOSS_BULLET_SPEED    = 4;        // Boss 子彈速度

interface Enemy {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  hp: number;
  maxHp: number;
  type: 'normal' | 'elite' | 'boss';
  xpValue: number; // 預先計算好的經驗值
  fireTimer?: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  life: number; // 剩餘顯示時間 (ms)
}

interface Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  damage: number;
  pierceLeft?: number; // 剩餘穿透次數 (玩家專屬)
  isEnemy?: boolean;   // 標記是否為敵方飛彈
}

// 這是純 JS 的邏輯層，不會被 React 的 render 週期影響
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private isPlaying: boolean = false;

  // 玩家狀態
  public player = {
    x: 0,
    y: 0,
    radius: 15,
    color: "#34d399",
    speed: 5,
  };
  private mouse = { x: 0, y: 0 };

  // 實體存放陣列
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = [];
  private floatingTexts: FloatingText[] = [];

  // 遊戲計時器
  private enemySpawnTimer: number = 0;
  private fireTimer: number = 0;
  private bossTimer: number = 0;        // 距離下一隻 Boss 的計時（ms）
  private bossWarningFired: boolean = false; // 這個週期的警告是否已觸發

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;

    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;

    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });
  }

  // == 核心遊戲迴圈 ==
  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (this.isPlaying) {
        this.update(deltaTime);
        this.draw();
        this.animationId = requestAnimationFrame(loop);
      }
    };

    this.animationId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);
  }

  // 重置引擎內部狀態
  public reset() {
    this.stop();
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.floatingTexts = [];
    this.enemySpawnTimer = 0;
    this.fireTimer = 0;
    this.bossTimer = 0;
    this.bossWarningFired = false;
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;

    this.ctx.fillStyle = "rgba(10, 10, 10, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // == 邏輯更新 ==
  private update(deltaTime: number) {
    const store = useGameStore.getState();
    const { weaponStats } = store;

    // 更新 Store 中的遊戲時間（供 UI 顯示倒數）
    store.tickGameTime(deltaTime);

    // 1. 移動玩家
    const dx = this.mouse.x - this.player.x;
    const dy = this.mouse.y - this.player.y;
    this.player.x += dx * weaponStats.lerpSpeed;
    this.player.y += dy * weaponStats.lerpSpeed;

    // 2. Boss 計時 ─────────────────────────────────────────
    this.bossTimer += deltaTime;

    // 出現前 10 秒出現警告（只觸發一次）
    const timeToNextBoss = BOSS_INTERVAL_MS - this.bossTimer;
    if (timeToNextBoss <= BOSS_WARNING_MS && !this.bossWarningFired && store.bossHp === null) {
      store.setBossWarning(true);
      this.bossWarningFired = true;
    }

    // 到達 2 分鐘且場上沒有 Boss 時生成
    if (this.bossTimer >= BOSS_INTERVAL_MS && store.bossHp === null) {
      this.spawnBoss();
      this.bossTimer = 0;
      this.bossWarningFired = false;
    }
    // ────────────────────────────────────────────────────

    // 3. 普通怪物生成
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > 2000) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 4. 玩家自動攻擊
    this.fireTimer += deltaTime;
    if (this.fireTimer > weaponStats.fireInterval && this.enemies.length > 0) {
      this.fireProjectile();
      this.fireTimer = 0;
    }

    // 5A. 更新玩家子彈
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * (deltaTime / 16);
      p.y += p.vy * (deltaTime / 16);

      if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
        this.projectiles.splice(i, 1);
      }
    }

    // 5B. 更新敵方子彈 + 玩家碰撞
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * (deltaTime / 16);
      ep.y += ep.vy * (deltaTime / 16);

      if (this.circleRectCollide(
        ep.x, ep.y, ep.radius,
        this.player.x - this.player.radius, this.player.y - this.player.radius,
        this.player.radius * 2, this.player.radius * 2
      )) {
        useGameStore.getState().takeDamage(ep.damage);
        this.enemyProjectiles.splice(i, 1);
        if (useGameStore.getState().health <= 0) { this.stop(); return; }
        continue;
      }

      if (ep.x < 0 || ep.x > this.canvas.width || ep.y < 0 || ep.y > this.canvas.height) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 5C. 更新飄動文字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= deltaTime;
      ft.y -= 0.5 * (deltaTime / 16); // 緩行向上
      ft.opacity = Math.max(0, ft.life / 1000); // 隨壽命淡出
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 6. 更新所有怪物
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const ex = enemy.x + enemy.size / 2;
      const ey = enemy.y + enemy.size / 2;
      const angleToPlayer = Math.atan2(this.player.y - ey, this.player.x - ex);

      enemy.x += Math.cos(angleToPlayer) * enemy.speed * (deltaTime / 16);
      enemy.y += Math.sin(angleToPlayer) * enemy.speed * (deltaTime / 16);

      // 菁英怪 / Boss 射擊冷卻
      if ((enemy.type === 'elite' || enemy.type === 'boss') && enemy.fireTimer !== undefined) {
        enemy.fireTimer += deltaTime;
        const interval = enemy.type === 'boss' ? BOSS_FIRE_INTERVAL : 1500;

        if (enemy.fireTimer >= interval) {
          enemy.fireTimer = 0;

          if (enemy.type === 'boss') {
            // Boss：發射全方向均等 N 發
            this.fireBossVolley(ex, ey);
          } else {
            // 菁英：朝玩家射 1 發
            this.enemyProjectiles.push({
              x: ex, y: ey, radius: 5,
              color: '#f59e0b',
              vx: Math.cos(angleToPlayer) * 5,
              vy: Math.sin(angleToPlayer) * 5,
              damage: 7.5, isEnemy: true,
            });
          }
        }
      }

      // 碰撞傷害
      if (this.circleRectCollide(this.player.x, this.player.y, this.player.radius, enemy.x, enemy.y, enemy.size, enemy.size)) {
        const dmg = enemy.type === 'boss' ? BOSS_CONTACT_DAMAGE : enemy.type === 'elite' ? 7.5 : 5;
        useGameStore.getState().takeDamage(dmg);
        enemy.x -= Math.cos(angleToPlayer) * 40;
        enemy.y -= Math.sin(angleToPlayer) * 40;
        if (useGameStore.getState().health <= 0) { this.stop(); return; }
      }

      // 玩家子彈命中怪物
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        if (this.circleRectCollide(p.x, p.y, p.radius, enemy.x, enemy.y, enemy.size, enemy.size)) {
          enemy.hp -= p.damage;

          // Boss 傷害同步到 Store（供血條顯示）
          if (enemy.type === 'boss') {
            useGameStore.getState().damageBoss(p.damage);
          }

          if (p.pierceLeft !== undefined && p.pierceLeft > 0) {
            p.pierceLeft -= 1;
          } else {
            this.projectiles.splice(j, 1);
          }

            if (enemy.hp <= 0) {
              const defeatedEnemy = this.enemies.splice(i, 1)[0];

              // 生成 XP 漂浮文字
              this.floatingTexts.push({
                x: defeatedEnemy.x + defeatedEnemy.size / 2,
                y: defeatedEnemy.y,
                text: `+${defeatedEnemy.xpValue} XP`,
                color: "#22d3ee", // 淺藍色 (與 store 同色系)
                opacity: 1,
                life: 1000,
              });

              if (enemy.type === 'boss') {
                useGameStore.getState().clearBossState();
                useGameStore.getState().addScore(500);
                useGameStore.getState().addExp(defeatedEnemy.xpValue);
              } else {
                const multiplier = enemy.type === 'elite' ? 2 : 1;
                useGameStore.getState().addScore(10 * multiplier);
                useGameStore.getState().addExp(defeatedEnemy.xpValue);
              }
              break;
            }
        }
      }
    }
  }

  // ── Boss 全方位彈幕 ──
  private fireBossVolley(bx: number, by: number) {
    const angleStep = (Math.PI * 2) / BOSS_BULLET_COUNT;
    for (let i = 0; i < BOSS_BULLET_COUNT; i++) {
      const angle = i * angleStep;
      this.enemyProjectiles.push({
        x: bx, y: by,
        radius: 7,
        color: '#c026d3', // 深紫色子彈
        vx: Math.cos(angle) * BOSS_BULLET_SPEED,
        vy: Math.sin(angle) * BOSS_BULLET_SPEED,
        damage: BOSS_BULLET_DAMAGE,
        isEnemy: true,
      });
    }
  }

  // 幾何演算法：圓形 vs 方形碰撞
  private circleRectCollide(cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number) {
    const testX = Math.max(rx, Math.min(cx, rx + rw));
    const testY = Math.max(ry, Math.min(cy, ry + rh));
    const distX = cx - testX;
    const distY = cy - testY;
    return Math.sqrt(distX * distX + distY * distY) <= cr;
  }

  // 輔助隨機範圍 (±20%)
  private applyVariance(base: number) {
    const factor = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
    return Math.round(base * factor);
  }

  // 生成普通/菁英怪
  private spawnEnemy() {
    const level = useGameStore.getState().level;
    const isElite = level > 1 && Math.random() < 0.2;

    const baseHp = 20 + level * 1.5;
    const enemyMaxHp = isElite ? baseHp * 1.5 : baseHp;
    const size = isElite ? 28 : 20;
    let baseSpeed = 1.3 + Math.random() * 0.5 + level * 0.05;
    if (isElite) baseSpeed *= 0.85;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -size : this.canvas.width + size;
      y = Math.random() * this.canvas.height;
    } else {
      x = Math.random() * this.canvas.width;
      y = Math.random() < 0.5 ? -size : this.canvas.height + size;
    }

    this.enemies.push({
      x, y, size,
      color: isElite ? "#f59e0b" : "#94a3b8",
      speed: baseSpeed,
      hp: this.applyVariance(enemyMaxHp), 
      maxHp: enemyMaxHp,
      type: isElite ? 'elite' : 'normal',
      xpValue: this.applyVariance(isElite ? 30 : 15),
      fireTimer: isElite ? 0 : undefined,
    });
  }

  // 生成 Boss（從畫面頂部中央入場）
  private spawnBoss() {
    const store = useGameStore.getState();
    const count = store.bossCount;                     // 已出現次數
    const bossMaxHp = BOSS_BASE_HP + count * BOSS_HP_SCALE;
    const bossSpeed = BOSS_BASE_SPEED + count * BOSS_SPEED_SCALE;
    const bossFinalHp = this.applyVariance(bossMaxHp);

    this.enemies.push({
      x: this.canvas.width / 2 - BOSS_SIZE / 2,
      y: -BOSS_SIZE,
      size: BOSS_SIZE,
      color: "#c026d3",      // 深紫色
      speed: bossSpeed,
      hp: bossFinalHp,
      maxHp: bossFinalHp,
      type: 'boss',
      xpValue: this.applyVariance(200),
      fireTimer: BOSS_FIRE_INTERVAL, // 立即開始射擊計時
    });

    // 通知 Store（供 UI 渲染 Boss 血條）
    store.spawnBossState(bossFinalHp);
  }

  // 玩家子彈（扇形多發）
  private fireProjectile() {
    const { weaponStats } = useGameStore.getState();

    let closestEnemy = this.enemies[0];
    let minDistance = Infinity;
    for (const enemy of this.enemies) {
      const ex = enemy.x + enemy.size / 2;
      const ey = enemy.y + enemy.size / 2;
      const dist = Math.hypot(this.player.x - ex, this.player.y - ey);
      if (dist < minDistance) { minDistance = dist; closestEnemy = enemy; }
    }
    if (!closestEnemy) return;

    const ex = closestEnemy.x + closestEnemy.size / 2;
    const ey = closestEnemy.y + closestEnemy.size / 2;
    const baseAngle = Math.atan2(ey - this.player.y, ex - this.player.x);
    const speed = 10;
    const count = weaponStats.projectileCount;
    const spreadAngle = 0.26;
    const startAngle = baseAngle - ((count - 1) / 2) * spreadAngle;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadAngle;
      this.projectiles.push({
        x: this.player.x, y: this.player.y,
        radius: weaponStats.bulletRadius,
        color: "#ef4444",
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: weaponStats.damage,
        pierceLeft: weaponStats.pierceCount,
      });
    }
  }

  // == 畫面渲染 ==
  private draw() {
    this.ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 怪物 + 血條
    for (const enemy of this.enemies) {
      this.ctx.fillStyle = enemy.color;
      this.ctx.shadowBlur = enemy.type === 'boss' ? 30 : enemy.type === 'elite' ? 15 : 10;
      this.ctx.shadowColor = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      this.ctx.shadowBlur = 0;

      // 菁英外框
      if (enemy.type === 'elite') {
        this.ctx.strokeStyle = `rgba(245, 158, 11, 0.4)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(enemy.x - 4, enemy.y - 4, enemy.size + 8, enemy.size + 8);
      }

      // Boss 多層外框
      if (enemy.type === 'boss') {
        // 外框 1
        this.ctx.strokeStyle = `rgba(192, 38, 211, 0.5)`;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(enemy.x - 6, enemy.y - 6, enemy.size + 12, enemy.size + 12);
        // 外框 2（旋轉感用 offset）
        this.ctx.strokeStyle = `rgba(192, 38, 211, 0.2)`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(enemy.x - 12, enemy.y - 12, enemy.size + 24, enemy.size + 24);

        // Boss 中心十字
        this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(enemy.x + enemy.size / 2, enemy.y + 4);
        this.ctx.lineTo(enemy.x + enemy.size / 2, enemy.y + enemy.size - 4);
        this.ctx.moveTo(enemy.x + 4, enemy.y + enemy.size / 2);
        this.ctx.lineTo(enemy.x + enemy.size - 4, enemy.y + enemy.size / 2);
        this.ctx.stroke();
      }

      // 血條（Boss 永遠顯示，其他受傷後顯示）
      if (enemy.hp < enemy.maxHp || enemy.type === 'elite' || enemy.type === 'boss') {
        const isPureHpBar = enemy.type === 'boss';
        const barWidth  = isPureHpBar ? enemy.size + 20 : enemy.size + 6;
        const barHeight = isPureHpBar ? 6 : 4;
        const barX = enemy.x - (barWidth - enemy.size) / 2;
        const barY = enemy.y - (isPureHpBar ? 16 : 12);
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

        this.ctx.fillStyle = "rgba(20, 20, 20, 0.7)";
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        if (enemy.type === 'boss') {
          this.ctx.fillStyle = `rgba(192, 38, 211, 0.9)`;
        } else if (enemy.type === 'elite') {
          this.ctx.fillStyle = `rgba(245, 158, 11, 0.9)`;
        } else {
          const r = 255;
          const g = Math.round(47 + 60 * (1 - hpRatio));
          const b = Math.round(87 * hpRatio + 53 * (1 - hpRatio));
          this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }

        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = this.ctx.fillStyle;
        this.ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        this.ctx.shadowBlur = 0;
      }
    }

    // 玩家子彈
    for (const p of this.projectiles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.shadowBlur = 0;
    }

    // 敵軍子彈
    for (const ep of this.enemyProjectiles) {
      this.ctx.beginPath();
      this.ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = ep.color;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = ep.color;
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.shadowBlur = 0;
    }

    // 玩家綠球
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.player.color;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.player.color;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.shadowBlur = 0;

    // 飄動文字渲染
    this.ctx.save();
    this.ctx.font = 'bold 16px Orbitron, Rajdhani, sans-serif';
    this.ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = ft.opacity;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }
    this.ctx.restore();
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
