// 這是純 JS 的邏輯層，不會被 React 的 render 週期影響
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private isPlaying: boolean = false;

  // 玩家狀態 (為了快速開始，我們做一個追隨滑鼠的圓形)
  public player = {
    x: 0,
    y: 0,
    radius: 15,
    color: '#34d399', // 主色調綠色
    speed: 5
  };

  private mouse = { x: 0, y: 0 };

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
      // 取得畫布在網頁上的實際大小與位置，確保縮放比例時滑鼠座標正確
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
    
    // 初始化最後更新時間
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      this.update(deltaTime);
      this.draw();

      if (this.isPlaying) {
        this.animationId = requestAnimationFrame(loop);
      }
    };
    
    this.animationId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);
  }

  // == 邏輯更新 (物理、移動、碰撞) ==
  private update(deltaTime: number) {
    // 讓玩家平滑地朝向滑鼠移動 (簡單的緩動效果 lerp)
    const dx = this.mouse.x - this.player.x;
    const dy = this.mouse.y - this.player.y;
    
    this.player.x += dx * 0.1;
    this.player.y += dy * 0.1;

    // TODO: 之後在這裡加入怪物尋路、子彈飛行、碰撞計算
  }

  // == 畫面渲染 ==
  private draw() {
    // 1. 清空畫布 (或者畫一個帶透明度的背景來產生殘影效果)
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.3)'; // 搭配目前網站的暗色風格
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. 畫出玩家
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.player.color;
    
    // 加一點發光效果 (Glow) 來搭配 Neon 質感
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.player.color;
    this.ctx.fill();
    this.ctx.closePath();

    // 重設發光避免影響到其他繪圖
    this.ctx.shadowBlur = 0;

    // TODO: 之後在這裡畫出敵人、背景、子彈
  }

  // 調整畫布大小時呼叫
  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
