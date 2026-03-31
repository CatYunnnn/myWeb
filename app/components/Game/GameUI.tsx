"use client";

// 負責所有的覆蓋層介面 (Overlay UI)，例如分數、血條、暫停選單
import { Gamepad2, Pause, Play, X } from "lucide-react";
import { useGameStore } from "../../store/useGameStore";

interface GameUIProps {
  onExit: () => void;
}

export function GameUI({ onExit }: GameUIProps) {
  const score = useGameStore(state => state.score);
  const health = useGameStore(state => state.health);
  const isPaused = useGameStore(state => state.isPaused);
  const togglePause = useGameStore(state => state.togglePause);
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* 頂部狀態列 */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="space-y-3">
           {/* 分數面板 */}
           <div className="flex items-center gap-3 text-white text-xl font-bold shadow-[0_5px_20px_rgba(0,0,0,0.5)] border border-white/10 bg-black/50 px-5 py-2 rounded-full backdrop-blur-md">
             <Gamepad2 size={24} className="text-accent" />
             <span>Score: {score}</span>
           </div>
           {/* 血條範例 */}
           <div className="w-56 h-3 bg-black/60 rounded-full border border-white/20 overflow-hidden backdrop-blur-md shadow-inner">
             <div 
               className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-300" 
               style={{ width: `${health}%` }} 
             />
           </div>
        </div>

        {/* 右上角控制列 */}
        <div className="flex gap-4">
          <button 
            onClick={togglePause}
            className="w-12 h-12 flex items-center justify-center bg-black/50 border border-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/10 hover:scale-105 transition-all shadow-[0_5px_20px_rgba(0,0,0,0.5)]"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
          
          <button 
            onClick={onExit}
            className="w-12 h-12 flex items-center justify-center bg-red-500/80 border border-red-400 hover:bg-red-500 text-white rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-105 transition-all"
            title="Exit Game"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* 暫停/升級覆蓋層 */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-[#0b1120] border border-border p-10 rounded-3xl text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-sm w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glow-accent),transparent_60%)] opacity-20" />
            
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-2 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">PAUSED</h2>
              <p className="text-slate-400 mb-8 font-medium">Take a breath, the swarm is waiting.</p>
              
              <button 
                onClick={togglePause}
                className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:-translate-y-1 transition-transform shadow-[0_10px_30px_-10px_var(--glow-accent)] text-lg tracking-wide group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Play size={20} className="group-hover:animate-pulse" fill="currentColor" />
                  RESUME
                </span>
              </button>
              
              <button 
                onClick={onExit}
                className="w-full mt-4 py-3 bg-transparent border border-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
