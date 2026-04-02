"use client";

// 負責所有的覆蓋層介面 (Overlay UI)，例如分數、血條、暫停選單
import { Pause, Play, RotateCcw, Skull, X, Zap, Shield, Star } from "lucide-react";
import { useGameStore } from "../../store/useGameStore";

interface GameUIProps {
  onExit: () => void;
}

export function GameUI({ onExit }: GameUIProps) {
  const score = useGameStore(state => state.score);
  const health = useGameStore(state => state.health);
  const isPaused = useGameStore(state => state.isPaused);
  const isGameOver = useGameStore(state => state.isGameOver);
  const level = useGameStore(state => state.level);
  const exp = useGameStore(state => state.exp);
  const expToNext = useGameStore(state => state.expToNext);
  const togglePause = useGameStore(state => state.togglePause);
  const resetGame = useGameStore(state => state.resetGame);

  const healthPercent = Math.max(0, health);
  const expPercent = expToNext > 0 ? (exp / expToNext) * 100 : 0;
  const isLowHealth = health <= 30;

  return (
    <>
      {/* 載入 Orbitron + Rajdhani 字體 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        .hud-font { font-family: 'Orbitron', monospace; }
        .hud-label { font-family: 'Rajdhani', sans-serif; }

        /* 切角面板 — 用 clip-path 做出科幻切角效果 */
        .hud-panel {
          background: rgba(8, 12, 24, 0.88);
          border: 1px solid rgba(0, 240, 255, 0.12);
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
          backdrop-filter: blur(16px);
          position: relative;
        }
        .hud-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.06) 0%, transparent 40%);
          pointer-events: none;
        }

        /* 血條切角 */
        .hp-bar-track {
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          background: rgba(255, 45, 85, 0.12);
        }
        .hp-bar-fill {
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }

        /* 經驗條 */
        .exp-bar-track {
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.15);
        }

        /* 低血量脈衝警告 */
        @keyframes lowHpPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .low-hp-pulse {
          animation: lowHpPulse 0.8s ease-in-out infinite;
        }

        /* 分數數字跳動 */
        @keyframes scoreGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(240, 225, 48, 0.4); }
          50% { text-shadow: 0 0 20px rgba(240, 225, 48, 0.8), 0 0 40px rgba(240, 225, 48, 0.3); }
        }

        /* 升級閃光 */
        @keyframes levelFlash {
          0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(0, 240, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
        }

        /* 面板入場動畫 */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-left { animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* 掃描線紋理 (全局覆蓋) */
        .scanlines::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 240, 255, 0.015) 2px,
            rgba(0, 240, 255, 0.015) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Game Over 動畫 */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(-3px, 1px); filter: hue-rotate(90deg); }
          94% { transform: translate(3px, -1px); filter: hue-rotate(-90deg); }
          96% { transform: translate(-1px, -2px); }
          98% { transform: translate(2px, 2px); filter: hue-rotate(45deg); }
        }
        @keyframes scalePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* 按鈕霓虹邊框 */
        .btn-neon {
          position: relative;
          overflow: hidden;
        }
        .btn-neon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 scanlines">
      
        {/* ═══════════════════════════════════
            頂部 HUD
        ═══════════════════════════════════ */}
        <div className="flex justify-between items-start pointer-events-auto relative z-10">
          
          {/* ── 左上角：狀態面板 ── */}
          <div className="space-y-2.5 animate-slide-left" style={{ minWidth: '280px' }}>
            
            {/* 分數 */}
            <div className="hud-panel px-5 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ 
                background: 'rgba(240, 225, 48, 0.12)',
                border: '1px solid rgba(240, 225, 48, 0.25)',
              }}>
                <Zap size={16} style={{ color: '#f0e130' }} fill="#f0e130" />
              </div>
              <div>
                <div className="hud-label text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(240, 225, 48, 0.6)' }}>
                  SCORE
                </div>
                <div className="hud-font text-xl font-bold leading-tight" style={{ 
                  color: '#f0e130',
                  animation: 'scoreGlow 3s ease-in-out infinite',
                }}>
                  {score.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 血量 */}
            <div className={`hud-panel px-5 py-3 ${isLowHealth ? 'low-hp-pulse' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Shield size={13} style={{ color: '#ff2d55' }} />
                  <span className="hud-label text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255, 45, 85, 0.7)' }}>
                    HP
                  </span>
                </div>
                <div className="hud-font text-sm font-semibold flex items-baseline gap-0.5">
                  <span style={{ color: isLowHealth ? '#ff6b35' : '#ff2d55' }}>{health}</span>
                  <span style={{ color: 'rgba(255, 45, 85, 0.35)' }}>/</span>
                  <span style={{ color: 'rgba(255, 45, 85, 0.35)' }}>100</span>
                </div>
              </div>
              <div className="hp-bar-track w-full h-2.5 relative overflow-hidden">
                <div 
                  className="hp-bar-fill h-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${healthPercent}%`,
                    background: isLowHealth 
                      ? 'linear-gradient(90deg, #ff6b35, #ff2d55)' 
                      : 'linear-gradient(90deg, #ff2d55, #ff4073)',
                    boxShadow: isLowHealth 
                      ? '0 0 12px rgba(255, 107, 53, 0.6), inset 0 0 8px rgba(255,255,255,0.15)' 
                      : '0 0 10px rgba(255, 45, 85, 0.5), inset 0 0 6px rgba(255,255,255,0.1)',
                  }} 
                />
                {/* 血條上的掃光效果 */}
                <div className="absolute inset-0 overflow-hidden" style={{
                  width: `${healthPercent}%`,
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                    animation: 'shimmer 2.5s ease-in-out infinite',
                  }} />
                </div>
              </div>
            </div>

            {/* 經驗值 + 等級 */}
            <div className="hud-panel px-5 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Star size={13} style={{ color: '#00f0ff' }} fill="#00f0ff" />
                  <span className="hud-font text-xs font-bold" style={{ 
                    color: '#00f0ff',
                    textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                  }}>
                    LV.{level}
                  </span>
                </div>
                <div className="hud-label text-[11px] font-medium" style={{ color: 'rgba(0, 240, 255, 0.5)' }}>
                  {exp} / {expToNext}
                </div>
              </div>
              <div className="exp-bar-track w-full h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${expPercent}%`,
                    background: 'linear-gradient(90deg, #00a8b5, #00f0ff)',
                    boxShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 2px rgba(0, 240, 255, 0.8)',
                  }} 
                />
              </div>
            </div>
          </div>

          {/* ── 右上角：控制按鈕 ── */}
          <div className="flex gap-3 animate-slide-right">
            <button 
              onClick={togglePause}
              className="btn-neon w-11 h-11 flex items-center justify-center text-white transition-all hover:scale-110"
              style={{
                background: 'rgba(8, 12, 24, 0.85)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
              title={isPaused ? "繼續" : "暫停"}
            >
              {isPaused 
                ? <Play size={18} fill="currentColor" style={{ color: '#00f0ff' }} /> 
                : <Pause size={18} fill="currentColor" style={{ color: '#00f0ff' }} />
              }
            </button>
            
            <button 
              onClick={onExit}
              className="btn-neon w-11 h-11 flex items-center justify-center text-white transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 45, 85, 0.15)',
                border: '1px solid rgba(255, 45, 85, 0.35)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
              title="離開遊戲"
            >
              <X size={20} style={{ color: '#ff2d55' }} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════
            暫停覆蓋層
        ═══════════════════════════════════ */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50" style={{
            background: 'rgba(4, 6, 14, 0.75)',
            backdropFilter: 'blur(8px)',
          }}>
            <div className="hud-panel p-10 text-center max-w-sm w-full" style={{
              boxShadow: '0 0 80px rgba(0, 240, 255, 0.08), inset 0 1px 0 rgba(0, 240, 255, 0.1)',
            }}>
              <div className="relative">
                {/* 裝飾性頂部橫線 */}
                <div className="mx-auto mb-6" style={{
                  width: '60px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                }} />
                
                <h2 className="hud-font text-3xl font-bold mb-2 uppercase tracking-[0.3em]" style={{ 
                  color: '#00f0ff',
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.1)',
                }}>PAUSED</h2>
                <p className="hud-label text-base mb-8" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                  深呼吸，蟲群正在等待。
                </p>
                
                <button 
                  onClick={togglePause}
                  className="btn-neon w-full py-4 text-white font-bold text-lg tracking-widest hud-font hover:-translate-y-0.5 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 168, 181, 0.3))',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                    boxShadow: '0 8px 32px -8px rgba(0, 240, 255, 0.3)',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play size={18} fill="currentColor" />
                    RESUME
                  </span>
                </button>
                
                <button 
                  onClick={onExit}
                  className="w-full mt-4 py-3 hud-label text-base font-medium transition-colors hover:text-white"
                  style={{ 
                    color: 'rgba(148, 163, 184, 0.6)',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  返回主選單
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            遊戲結束覆蓋層
        ═══════════════════════════════════ */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50" style={{
            background: 'rgba(4, 2, 8, 0.85)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.6s ease-out',
          }}>
            {/* 背景掃描線 */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 45, 85, 0.02) 3px, rgba(255, 45, 85, 0.02) 6px)',
            }} />

            {/* 紅色暗角 */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(255, 45, 85, 0.08) 100%)',
            }} />
            
            <div className="hud-panel p-10 text-center max-w-[380px] w-full relative" style={{
              borderColor: 'rgba(255, 45, 85, 0.2)',
              boxShadow: '0 0 100px rgba(255, 45, 85, 0.1), inset 0 1px 0 rgba(255, 45, 85, 0.15)',
            }}>
              {/* 頂部紅色光暈 */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at top, rgba(255, 45, 85, 0.12), transparent 60%)',
                clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
              }} />
              
              <div className="relative">
                {/* 骷髏圖標 */}
                <div className="mx-auto w-20 h-20 flex items-center justify-center mb-5" style={{
                  background: 'rgba(255, 45, 85, 0.08)',
                  border: '1px solid rgba(255, 45, 85, 0.25)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  animation: 'scalePulse 2s ease-in-out infinite',
                }}>
                  <Skull size={36} style={{ color: '#ff2d55' }} />
                </div>
                
                <h2 className="hud-font text-3xl font-bold mb-1.5 uppercase tracking-[0.3em]" style={{
                  color: '#ff2d55',
                  textShadow: '0 0 20px rgba(255, 45, 85, 0.5), 0 0 60px rgba(255, 45, 85, 0.15)',
                  animation: 'glitch 3s infinite',
                }}>GAME OVER</h2>
                <p className="hud-label text-sm mb-6" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                  蟲群已將你吞噬。
                </p>
                
                {/* 數據面板 */}
                <div className="grid grid-cols-2 gap-2.5 mb-7">
                  <div className="py-3 px-4 text-center" style={{ 
                    background: 'rgba(240, 225, 48, 0.04)',
                    border: '1px solid rgba(240, 225, 48, 0.1)',
                  }}>
                    <div className="hud-label text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: 'rgba(240, 225, 48, 0.5)' }}>
                      最終分數
                    </div>
                    <div className="hud-font text-2xl font-bold" style={{ 
                      color: '#f0e130',
                      textShadow: '0 0 10px rgba(240, 225, 48, 0.3)',
                    }}>
                      {score.toLocaleString()}
                    </div>
                  </div>
                  <div className="py-3 px-4 text-center" style={{ 
                    background: 'rgba(0, 240, 255, 0.04)',
                    border: '1px solid rgba(0, 240, 255, 0.1)',
                  }}>
                    <div className="hud-label text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: 'rgba(0, 240, 255, 0.5)' }}>
                      到達等級
                    </div>
                    <div className="hud-font text-2xl font-bold" style={{ 
                      color: '#00f0ff',
                      textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                    }}>
                      LV.{level}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={resetGame}
                  className="btn-neon w-full py-4 text-white font-bold text-lg tracking-widest hud-font hover:-translate-y-0.5 transition-all group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.25), rgba(255, 45, 85, 0.15))',
                    border: '1px solid rgba(255, 45, 85, 0.4)',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                    boxShadow: '0 8px 32px -8px rgba(255, 45, 85, 0.3)',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <RotateCcw size={18} className="group-hover:animate-spin" />
                    再來一次
                  </span>
                </button>
                
                <button 
                  onClick={onExit}
                  className="w-full mt-3 py-2.5 hud-label text-sm font-medium transition-colors hover:text-white"
                  style={{ 
                    color: 'rgba(148, 163, 184, 0.5)',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  返回主選單
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
