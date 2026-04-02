import { useGameStore } from "../../store/useGameStore";

interface Enemy {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  hp: number;
  maxHp: number;
  type: 'normal' | 'elite';
  fireTimer?: number;
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
    color: "#34d399", // 主色調綠球
    speed: 5,
  };
  private mouse = { x: 0, y: 0 };

  // 實體存放陣列
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = []; // 敵軍專用彈幕

  // 計時器
  private enemySpawnTimer: number = 0;
  private fireTimer: number = 0;

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

  // 重置引擎內部狀態 (用於重新開始遊戲)
  public reset() {
    this.stop();
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemySpawnTimer = 0;
    this.fireTimer = 0;
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;

    // 清空畫面
    this.ctx.fillStyle = "rgba(10, 10, 10, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // == 邏輯更新 ==
  private update(deltaTime: number) {
    const store = useGameStore.getState();
    const { weaponStats } = store;

    // 1. 移動玩家 (lerp 緩動緩衝) - 讀取 weaponStats.lerpSpeed
    const dx = this.mouse.x - this.player.x;
    const dy = this.mouse.y - this.player.y;
    this.player.x += dx * weaponStats.lerpSpeed;
    this.player.y += dy * weaponStats.lerpSpeed;

    // 2. 控制怪物生成頻率
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > 2000) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 3. 控制自動攻擊頻率 - 讀取 weaponStats.fireInterval
    this.fireTimer += deltaTime;
    if (this.fireTimer > weaponStats.fireInterval && this.enemies.length > 0) {
      this.fireProjectile();
      this.fireTimer = 0;
    }

    // 4A. 更新玩家子彈軌跡，並移除超出邊界的子彈
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * (deltaTime / 16);
      p.y += p.vy * (deltaTime / 16);

      if (
        p.x < 0 ||
        p.x > this.canvas.width ||
        p.y < 0 ||
        p.y > this.canvas.height
      ) {
        this.projectiles.splice(i, 1);
      }
    }

    // 4B. 更新敵方子彈軌跡與玩家碰撞判定
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * (deltaTime / 16);
      ep.y += ep.vy * (deltaTime / 16);

      // (A) 檢查有沒有擊中玩家
      if (this.circleRectCollide(ep.x, ep.y, ep.radius, this.player.x - this.player.radius, this.player.y - this.player.radius, this.player.radius * 2, this.player.radius * 2)) {
        useGameStore.getState().takeDamage(ep.damage); // 通常是 7.5
        this.enemyProjectiles.splice(i, 1);
        
        // 血量歸零
        if (useGameStore.getState().health <= 0) {
          this.stop();
          return;
        }
        continue;
      }

      // (B) 移除出界的敵軍子彈
      if (
        ep.x < 0 ||
        ep.x > this.canvas.width ||
        ep.y < 0 ||
        ep.y > this.canvas.height
      ) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 5. 更新怪物路徑與碰撞處理
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // 計算中心點以鎖定追蹤
      const ex = enemy.x + enemy.size / 2;
      const ey = enemy.y + enemy.size / 2;
      const angleToPlayer = Math.atan2(this.player.y - ey, this.player.x - ex);

      enemy.x += Math.cos(angleToPlayer) * enemy.speed * (deltaTime / 16);
      enemy.y += Math.sin(angleToPlayer) * enemy.speed * (deltaTime / 16);

      // (菁英怪專用) 射擊冷卻處理
      if (enemy.type === 'elite' && enemy.fireTimer !== undefined) {
        enemy.fireTimer += deltaTime;
        // 菁英每 1500 毫秒射擊一次
        if (enemy.fireTimer >= 1500) {
          const aimAngle = angleToPlayer;
          const bulletSpeed = 5; 
          this.enemyProjectiles.push({
            x: ex,
            y: ey,
            radius: 5,
            color: '#f59e0b', // 橘黃色的菁英子彈
            vx: Math.cos(aimAngle) * bulletSpeed,
            vy: Math.sin(aimAngle) * bulletSpeed,
            damage: 7.5, // 普通傷害5的1.5倍
            isEnemy: true,
          });
          enemy.fireTimer = 0;
        }
      }

      // (A) 玩家是否被怪物撞到了? (Circle vs Rect)
      if (
        this.circleRectCollide(
          this.player.x,
          this.player.y,
          this.player.radius,
          enemy.x,
          enemy.y,
          enemy.size,
          enemy.size,
        )
      ) {
        // 菁英怪傷害1.5倍
        const dmg = enemy.type === 'elite' ? 7.5 : 5;
        useGameStore.getState().takeDamage(dmg); 
        
        // 把怪物稍微彈開
        enemy.x -= Math.cos(angleToPlayer) * 40;
        enemy.y -= Math.sin(angleToPlayer) * 40;

        // 血量歸零 → 停止遊戲引擎
        if (useGameStore.getState().health <= 0) {
          this.stop();
          return;
        }
      }

      // (B) 怪物是否被玩家子彈打中? (Circle 子彈 vs Rect 怪物)
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        if (
          this.circleRectCollide(
            p.x,
            p.y,
            p.radius,
            enemy.x,
            enemy.y,
            enemy.size,
            enemy.size,
          )
        ) {
          enemy.hp -= p.damage;

          // 穿透邏輯
          if (p.pierceLeft !== undefined && p.pierceLeft > 0) {
            p.pierceLeft -= 1;
          } else {
            this.projectiles.splice(j, 1); // 子彈耗盡穿透次數後消失
          }

          if (enemy.hp <= 0) {
            this.enemies.splice(i, 1); // 怪物死亡
            
            // 菁英怪掉落較多資源
            const baseScore = 10;
            const baseExp = 15;
            const multiplier = enemy.type === 'elite' ? 2 : 1; // 菁英怪掉兩倍資源

            useGameStore.getState().addScore(baseScore * multiplier); 
            useGameStore.getState().addExp(baseExp * multiplier); 
            break; // 怪物死掉就不再檢測這隻怪身上其他的子彈了
          }
        }
      }
    }
  }

  // == 幾何演算法：檢測圓形與方形的碰撞 ==
  private circleRectCollide(
    cx: number,
    cy: number,
    cr: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
  ) {
    const testX = Math.max(rx, Math.min(cx, rx + rw));
    const testY = Math.max(ry, Math.min(cy, ry + rh));

    const distX = cx - testX;
    const distY = cy - testY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance <= cr;
  }

  // 怪物在一畫面四個邊緣以外隨機生成
  private spawnEnemy() {
    const level = useGameStore.getState().level;
    
    // 生成菁英怪機率 (20%)，第一級先不出菁英怪防止新手被秒
    const isElite = level > 1 && Math.random() < 0.2;
    
    // 怪物的血量隨等級難度成長
    const baseHp = 20 + level * 1.5;
    const enemyMaxHp = isElite ? baseHp * 1.5 : baseHp;

    const size = isElite ? 28 : 20;
    
    // 怪物速度隨等級提昇 (菁英怪為了平衡設計為略慢一些)
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
      x,
      y,
      size,
      color: isElite ? "#f59e0b" : "#94a3b8", // 菁英帶有橘黃色
      speed: baseSpeed, 
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      type: isElite ? 'elite' : 'normal',
      fireTimer: isElite ? 0 : undefined, // 菁英怪才有射擊冷卻計時器
    });
  }

  // 朝向距離最近的怪物發射子彈
  private fireProjectile() {
    const { weaponStats } = useGameStore.getState();

    let closestEnemy = this.enemies[0];
    let minDistance = Infinity;

    // 尋找目標
    for (const enemy of this.enemies) {
      const ex = enemy.x + enemy.size / 2;
      const ey = enemy.y + enemy.size / 2;
      const dist = Math.hypot(this.player.x - ex, this.player.y - ey);
      if (dist < minDistance) {
        minDistance = dist;
        closestEnemy = enemy;
      }
    }

    if (!closestEnemy) return;

    // 發射紅圈
    const ex = closestEnemy.x + closestEnemy.size / 2;
    const ey = closestEnemy.y + closestEnemy.size / 2;
    const baseAngle = Math.atan2(ey - this.player.y, ex - this.player.x);
    const speed = 10;
    
    const count = weaponStats.projectileCount;
    const spreadAngle = 0.26; // 扇形夾角 (~15度)
    const startAngle = baseAngle - ((count - 1) / 2) * spreadAngle;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadAngle;
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        radius: weaponStats.bulletRadius,
        color: "#ef4444",
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: weaponStats.damage,
        pierceLeft: weaponStats.pierceCount
      });
    }
  }

  // == 畫面渲染 ==
  private draw() {
    // 1. 清空殘影背景
    this.ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. 畫出每一個怪物 + 血條
    for (const enemy of this.enemies) {
      // 怪物方形本體
      this.ctx.fillStyle = enemy.color;
      this.ctx.shadowBlur = enemy.type === 'elite' ? 15 : 10;
      this.ctx.shadowColor = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      this.ctx.shadowBlur = 0;
      
      // 菁英怪額外的光環
      if (enemy.type === 'elite') {
        this.ctx.strokeStyle = `rgba(245, 158, 11, 0.4)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(enemy.x - 4, enemy.y - 4, enemy.size + 8, enemy.size + 8);
      }

      // 怪物血條 — 只在受傷後才顯示，或是菁英怪永遠顯示
      if (enemy.hp < enemy.maxHp || enemy.type === 'elite') {
        const barWidth = enemy.size + 6;
        const barHeight = 4;
        const barX = enemy.x - 3;
        const barY = enemy.y - 12;
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

        // 血條底色（軌道）
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血條前景
        if (enemy.type === 'elite') {
           this.ctx.fillStyle = `rgba(245, 158, 11, 0.9)`; // 菁英橘色血條
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

    // 3. 畫出每一發玩家子彈
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

    // 4. 畫出每一發敵軍子彈
    for (const ep of this.enemyProjectiles) {
      this.ctx.beginPath();
      this.ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = ep.color;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = ep.color; // 橘紅色光暈
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.shadowBlur = 0;
    }

    // 5. 畫出玩家綠球
    this.ctx.beginPath();
    this.ctx.arc(
      this.player.x,
      this.player.y,
      this.player.radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fillStyle = this.player.color;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.player.color;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.shadowBlur = 0;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
