import { useGameStore } from '../../store/useGameStore';

interface Enemy {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  hp: number;
  maxHp: number;
}

interface Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  damage: number;
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
    color: '#34d399', // 主色調綠球
    speed: 5
  };
  private mouse = { x: 0, y: 0 };

  // 實體存放陣列
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];

  // 計時器
  private enemySpawnTimer: number = 0;
  private fireTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;

    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;

    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
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
    this.enemySpawnTimer = 0;
    this.fireTimer = 0;
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;

    // 清空畫面
    this.ctx.fillStyle = 'rgba(10, 10, 10, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // == 邏輯更新 ==
  private update(deltaTime: number) {
    // 1. 移動玩家 (lerp 緩動緩衝)
    const dx = this.mouse.x - this.player.x;
    const dy = this.mouse.y - this.player.y;
    this.player.x += dx * 0.1;
    this.player.y += dy * 0.1;

    // 2. 控制怪物生成頻率 (預設每秒 1 隻)
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > 1000) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 3. 控制自動攻擊頻率 (預設每 0.5 秒發射一發子彈)
    this.fireTimer += deltaTime;
    if (this.fireTimer > 500 && this.enemies.length > 0) {
      this.fireProjectile();
      this.fireTimer = 0;
    }

    // 4. 更新子彈軌跡，並移除超出邊界的子彈
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * (deltaTime / 16);
      p.y += p.vy * (deltaTime / 16);

      if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
        this.projectiles.splice(i, 1);
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

      // (A) 玩家是否被怪物撞到了? (Circle vs Rect)
      if (this.circleRectCollide(this.player.x, this.player.y, this.player.radius, enemy.x, enemy.y, enemy.size, enemy.size)) {
        useGameStore.getState().takeDamage(5); // 扣 5Hp
        // 把怪物稍微彈開
        enemy.x -= Math.cos(angleToPlayer) * 40;
        enemy.y -= Math.sin(angleToPlayer) * 40;

        // 血量歸零 → 停止遊戲引擎
        if (useGameStore.getState().health <= 0) {
          this.stop();
          return;
        }
      }

      // (B) 怪物是否被任何子彈打中? (Circle 子彈 vs Rect 怪物)
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        if (this.circleRectCollide(p.x, p.y, p.radius, enemy.x, enemy.y, enemy.size, enemy.size)) {
          enemy.hp -= p.damage;
          this.projectiles.splice(j, 1); // 子彈命中後消失
          
          if (enemy.hp <= 0) {
            this.enemies.splice(i, 1); // 怪物死亡
            useGameStore.getState().addScore(10); // 拿 10 分
            useGameStore.getState().addExp(15);    // 拿 15 經驗值
            break; // 怪物死掉就不再檢測這隻怪身上其他的子彈了
          }
        }
      }
    }
  }

  // == 幾何演算法：檢測圓形與方形的碰撞 ==
  private circleRectCollide(cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number) {
    const testX = Math.max(rx, Math.min(cx, rx + rw));
    const testY = Math.max(ry, Math.min(cy, ry + rh));

    const distX = cx - testX;
    const distY = cy - testY;
    const distance = Math.sqrt((distX * distX) + (distY * distY));

    return distance <= cr;
  }

  // 怪物在一畫面四個邊緣以外隨機生成
  private spawnEnemy() {
    const size = 20;
    const enemyMaxHp = 20;
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
      color: '#94a3b8', // 暗色系灰色怪物方形
      speed: 1.5 + Math.random(), // 些微的隨機移速
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
    });
  }

  // 朝向距離最近的怪物發射子彈
  private fireProjectile() {
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
    const angle = Math.atan2(ey - this.player.y, ex - this.player.x);
    const speed = 10;
    
    this.projectiles.push({
      x: this.player.x,
      y: this.player.y,
      radius: 6,
      color: '#ef4444', 
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: 10
    });
  }

  // == 畫面渲染 ==
  private draw() {
    // 1. 清空殘影背景
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.4)'; 
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. 畫出每一個怪物 + 血條
    for (const enemy of this.enemies) {
      // 怪物方形本體
      this.ctx.fillStyle = enemy.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      this.ctx.shadowBlur = 0;

      // 怪物血條 — 只在受傷後才顯示
      if (enemy.hp < enemy.maxHp) {
        const barWidth = enemy.size + 6;
        const barHeight = 3;
        const barX = enemy.x - 3;
        const barY = enemy.y - 8;
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

        // 血條底色（軌道）
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血條前景 — 根據血量百分比漸變色 (紅 → 橘)
        const r = 255;
        const g = Math.round(47 + (60 * (1 - hpRatio))); // 紅腐 → 橘
        const b = Math.round(87 * hpRatio + 53 * (1 - hpRatio));
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
        this.ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        this.ctx.shadowBlur = 0;
      }
    }

    // 3. 畫出每一發子彈
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

    // 4. 畫出玩家綠球
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
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
