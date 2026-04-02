"use client";

// 負責所有的覆蓋層介面 (Overlay UI)，例如分數、血條、暫停選單
import { Pause, Play, RotateCcw, Skull, X, Zap, Shield, Star, Crown, Target, Zap as ZapFast } from "lucide-react";
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
  const pendingUpgrades = useGameStore(state => state.pendingUpgrades);
  const selectUpgrade = useGameStore(state => state.selectUpgrade);
  const isUpgrading = useGameStore(state => state.isUpgrading);
  const togglePause = useGameStore(state => state.togglePause);
  const resetGame = useGameStore(state => state.resetGame);
  // Boss 狀態
  const bossWarning = useGameStore(state => state.bossWarning);
  const bossHp = useGameStore(state => state.bossHp);
  const bossMaxHp = useGameStore(state => state.bossMaxHp);
  const gameTime = useGameStore(state => state.gameTime);

  const healthPercent = Math.max(0, health);
  const expPercent = expToNext > 0 ? (exp / expToNext) * 100 : 0;
  const isLowHealth = health <= 30;

  // Boss 倒數計算：從 120 秒週期內的剩餘時間
  const bossCountdown = Math.max(0, Math.ceil((120_000 - (gameTime % 120_000)) / 1000));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Boss 警告 Banner */}
      {bossWarning && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center z-40 pointer-events-none animate-pulse">
          <div className="border border-[#c026d3]/50 bg-[rgba(0,0,0,0.85)] backdrop-blur-sm px-8 py-4 text-center shadow-[0_0_40px_rgba(192,38,211,0.3)]">
            <p className="font-rajdhani text-xs tracking-[0.3em] text-[#c026d3]/70 uppercase mb-1">★ WARNING ★</p>
            <p className="font-orbitron text-2xl font-bold text-[#c026d3] tracking-[0.2em] drop-shadow-[0_0_15px_rgba(192,38,211,0.8)]">
              BOSS INCOMING
            </p>
            <p className="font-rajdhani text-sm text-[#c026d3]/60 mt-1 tracking-widest">
              PREPARE FOR BATTLE
            </p>
          </div>
        </div>
      )}

      {/* 暫停覆蓋層 */}
      <div className="absolute inset-0 hud-scanlines z-[1]" />

      {/* ═══════════════════════════════════
          頂部 HUD
      ═══════════════════════════════════ */}
      <div className="flex justify-between items-start pointer-events-auto relative z-10">
        
        {/* ── 左上角：狀態面板 ── */}
        <div className="space-y-2.5 animate-hud-slide-left min-w-[280px]">
          
          {/* 分數 */}
          <div className="hud-panel px-5 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-neon-yellow/10 border border-neon-yellow/25">
              <Zap size={16} className="text-neon-yellow fill-neon-yellow" />
            </div>
            <div>
              <div className="font-rajdhani text-[10px] tracking-[0.2em] uppercase text-neon-yellow/60">
                SCORE
              </div>
              <div className="font-orbitron text-xl font-bold leading-tight text-neon-yellow animate-score-glow">
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 血量 */}
          <div className={`hud-panel px-5 py-3 ${isLowHealth ? 'animate-low-hp-pulse' : ''}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-neon-red" />
                <span className="font-rajdhani text-[10px] tracking-[0.2em] uppercase text-neon-red/70">
                  HP
                </span>
              </div>
              <div className="font-orbitron text-sm font-semibold flex items-baseline gap-0.5">
                <span className={isLowHealth ? 'text-neon-orange' : 'text-neon-red'}>{health}</span>
                <span className="text-neon-red/35">/</span>
                <span className="text-neon-red/35">100</span>
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
            </div>
          </div>

          {/* 經驗值 + 等級 */}
          <div className="hud-panel px-5 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Star size={13} className="text-neon-cyan fill-neon-cyan" />
                <span className="font-orbitron text-xs font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  LV.{level}
                </span>
              </div>
              <div className="font-rajdhani text-[11px] font-medium text-neon-cyan/50">
                {exp} / {expToNext}
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-neon-cyan/8 border border-neon-cyan/15">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#00a8b5] to-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.5),0_0_2px_rgba(0,240,255,0.8)]"
                style={{ width: `${expPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* ── 右上角：控制按鈕 ── */}
        <div className="flex gap-3 animate-hud-slide-right">
          {/* Boss 倒數提示 */}
          {bossHp === null && (
            <div className={`hud-panel px-3 py-1 flex items-center gap-2 border-[#c026d3]/30 bg-[#c026d3]/5`}>
              <Crown size={13} className="text-[#c026d3]" />
              <span className="font-orbitron text-xs font-bold text-[#c026d3]">
                {bossCountdown}s
              </span>
            </div>
          )}
          <button 
            onClick={togglePause}
            className="relative overflow-hidden w-11 h-11 flex items-center justify-center text-white transition-all hover:scale-110 bg-[rgba(8,12,24,0.88)] border border-neon-cyan/20 hud-cut-sm"
            title={isPaused ? "繼續" : "暫停"}
          >
            <div className="btn-neon-shine" />
            {isPaused 
              ? <Play size={18} className="text-neon-cyan fill-neon-cyan" /> 
              : <Pause size={18} className="text-neon-cyan fill-neon-cyan" />
            }
          </button>
          
          <button 
            onClick={onExit}
            className="relative overflow-hidden w-11 h-11 flex items-center justify-center text-white transition-all hover:scale-110 bg-neon-red/15 border border-neon-red/35 hud-cut-sm"
            title="離開遊戲"
          >
            <div className="btn-neon-shine" />
            <X size={20} className="text-neon-red" />
          </button>
        </div>
      </div>

      {/* Boss 奇香血條—場上有 Boss 時顯示 */}
      {bossHp !== null && bossMaxHp !== null && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20 animate-hud-fade-in">
          <div className="hud-panel px-4 py-2.5 border-[#c026d3]/40 bg-[#c026d3]/5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Crown size={13} className="text-[#c026d3]" />
                <span className="font-orbitron text-xs font-bold text-[#c026d3] tracking-widest">
                  BOSS
                </span>
              </div>
              <span className="font-orbitron text-xs text-[#c026d3]/70">
                {Math.ceil(bossHp)} / {bossMaxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-black/50 relative overflow-hidden rounded-sm">
              <div
                className="h-full transition-all duration-200 ease-out"
                style={{
                  width: `${(bossHp / bossMaxHp) * 100}%`,
                  background: 'linear-gradient(90deg, #7e22ce, #c026d3, #e879f9)',
                  boxShadow: '0 0 12px rgba(192,38,211,0.7), inset 0 0 6px rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          暫停覆蓋層
      ═══════════════════════════════════ */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-[rgba(4,6,14,0.75)] backdrop-blur-md">
          <div className="hud-panel p-10 text-center max-w-sm w-full shadow-[0_0_80px_rgba(0,240,255,0.08),inset_0_1px_0_rgba(0,240,255,0.1)]">
            <div className="relative">
              {/* 裝飾性頂部橫線 */}
              <div className="mx-auto mb-6 w-[60px] h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
              
              <h2 className="font-orbitron text-3xl font-bold mb-2 uppercase tracking-[0.3em] text-neon-cyan drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                PAUSED
              </h2>
              <p className="font-rajdhani text-base mb-8 text-slate-400/70">
                深呼吸，蟲群正在等待。
              </p>
              
              <button 
                onClick={togglePause}
                className="relative overflow-hidden w-full py-4 text-white font-bold text-lg tracking-widest font-orbitron hover:-translate-y-0.5 transition-all bg-gradient-to-br from-neon-cyan/20 to-[rgba(0,168,181,0.3)] border border-neon-cyan/40 hud-cut-md shadow-[0_8px_32px_-8px_rgba(0,240,255,0.3)]"
              >
                <div className="btn-neon-shine" />
                <span className="relative flex items-center justify-center gap-2">
                  <Play size={18} fill="currentColor" />
                  RESUME
                </span>
              </button>
              
              <button 
                onClick={onExit}
                className="w-full mt-4 py-3 font-rajdhani text-base font-medium transition-colors hover:text-white text-slate-400/60 bg-transparent border border-white/5"
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-[rgba(4,2,8,0.85)] backdrop-blur-xl animate-hud-fade-in">
          {/* 背景掃描線 */}
          <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,45,85,0.02)_3px,rgba(255,45,85,0.02)_6px)]" />
          {/* 紅色暗角 */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,45,85,0.08)_100%)]" />
          
          <div className="hud-panel p-10 text-center max-w-[380px] w-full relative border-neon-red/20 shadow-[0_0_100px_rgba(255,45,85,0.1),inset_0_1px_0_rgba(255,45,85,0.15)]">
            {/* 頂部紅色光暈 */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,45,85,0.12),transparent_60%)] hud-panel" />
            
            <div className="relative">
              {/* 骷髏圖標 */}
              <div className="mx-auto w-20 h-20 flex items-center justify-center mb-5 bg-neon-red/8 border border-neon-red/25 hud-hex animate-scale-pulse">
                <Skull size={36} className="text-neon-red" />
              </div>
              
              <h2 className="font-orbitron text-3xl font-bold mb-1.5 uppercase tracking-[0.3em] text-neon-red drop-shadow-[0_0_20px_rgba(255,45,85,0.5)] animate-glitch">
                GAME OVER
              </h2>
              <p className="font-rajdhani text-sm mb-6 text-slate-400/50">
                蟲群已將你吞噬。
              </p>
              
              {/* 數據面板 */}
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                <div className="py-3 px-4 text-center bg-neon-yellow/4 border border-neon-yellow/10">
                  <div className="font-rajdhani text-[10px] tracking-[0.15em] uppercase mb-1 text-neon-yellow/50">
                    最終分數
                  </div>
                  <div className="font-orbitron text-2xl font-bold text-neon-yellow drop-shadow-[0_0_10px_rgba(240,225,48,0.3)]">
                    {score.toLocaleString()}
                  </div>
                </div>
                <div className="py-3 px-4 text-center bg-neon-cyan/4 border border-neon-cyan/10">
                  <div className="font-rajdhani text-[10px] tracking-[0.15em] uppercase mb-1 text-neon-cyan/50">
                    到達等級
                  </div>
                  <div className="font-orbitron text-2xl font-bold text-neon-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                    LV.{level}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={resetGame}
                className="relative overflow-hidden w-full py-4 text-white font-bold text-lg tracking-widest font-orbitron hover:-translate-y-0.5 transition-all group bg-gradient-to-br from-neon-red/25 to-neon-red/15 border border-neon-red/40 hud-cut-md shadow-[0_8px_32px_-8px_rgba(255,45,85,0.3)]"
              >
                <div className="btn-neon-shine" />
                <span className="relative flex items-center justify-center gap-2">
                  <RotateCcw size={18} className="group-hover:animate-spin" />
                  再來一次
                </span>
              </button>
              
              <button 
                onClick={onExit}
                className="w-full mt-3 py-2.5 font-rajdhani text-sm font-medium transition-colors hover:text-white text-slate-400/50 bg-transparent border border-white/4"
              >
                返回主選單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          升級覆蓋層 (Level Up Upgrade Selection)
      ═══════════════════════════════════ */}
      {isUpgrading && pendingUpgrades.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-[60] bg-[rgba(0,10,20,0.85)] backdrop-blur-md animate-hud-fade-in">
          {/* 背景光環 */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]" />

          <div className="text-center w-full max-w-4xl px-4">
            <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-2 uppercase tracking-[0.4em] text-neon-cyan drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] animate-pulse">
              LEVEL UP
            </h2>
            <p className="font-rajdhani text-lg md:text-xl mb-12 text-neon-cyan/50 tracking-widest uppercase">
              Select your upgrade
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              {pendingUpgrades.map((upgrade, index) => {
                // 定義稀有度對應的樣式
                const isEpic = upgrade.rarity === 'epic';
                const isRare = upgrade.rarity === 'rare';
                
                const borderColor = isEpic ? 'border-[#a855f7]/50' : isRare ? 'border-[#3b82f6]/50' : 'border-white/20';
                const bgColor = isEpic ? 'bg-[#a855f7]/10' : isRare ? 'bg-[#3b82f6]/10' : 'bg-white/5';
                const shadowGlow = isEpic ? 'shadow-[0_0_30px_rgba(168,85,247,0.3)]' : isRare ? 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' : '';
                const textColor = isEpic ? 'text-[#e9d5ff]' : isRare ? 'text-[#bfdbfe]' : 'text-slate-200';
                const labelColor = isEpic ? 'text-[#a855f7]' : isRare ? 'text-[#3b82f6]' : 'text-slate-400';
                const labelText = isEpic ? 'EPIC' : isRare ? 'RARE' : 'COMMON';

                return (
                  <button
                    key={upgrade.id}
                    onClick={() => selectUpgrade(upgrade.id)}
                    className={`flex-1 relative group hud-panel hud-cut-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] p-6 md:p-8 text-left ${borderColor} ${bgColor} ${shadowGlow}`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Hover光澤 */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    
                    {/* 稀有度標籤 */}
                    <div className={`font-rajdhani text-xs tracking-[0.3em] font-bold mb-4 ${labelColor}`}>
                      {labelText}
                    </div>

                    {/* 圖示 */}
                    <div className="text-4xl mb-4 grayscale-[0.2] transition-all group-hover:grayscale-0 group-hover:scale-110 origin-left">
                      {upgrade.icon}
                    </div>

                    {/* 標題與描述 */}
                    <h3 className={`font-orbitron text-xl md:text-2xl font-bold mb-3 tracking-wide ${textColor}`}>
                      {upgrade.name}
                    </h3>
                    
                    <p className="font-rajdhani text-sm md:text-base text-slate-300/80 leading-relaxed border-t border-white/10 pt-4 mt-auto">
                      {upgrade.description}
                    </p>
                    
                    {/* EPic 特效 */}
                    {isEpic && (
                      <div className="absolute inset-0 border border-[#a855f7]/30 hud-cut-md animate-pulse pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
