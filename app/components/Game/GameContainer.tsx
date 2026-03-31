"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { useGameStore } from '../../store/useGameStore';

export function GameContainer() {
  const router = useRouter();
  
  // 當容器載入或卸載時，初始化遊戲狀態
  const resetGame = useGameStore(state => state.resetGame);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleExit = () => {
    // 退場時清除狀態並返回首頁
    resetGame();
    router.push('/');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black selection:bg-transparent">
      {/* 1. 底層 60FPS 渲染層 (Pure TypeScript Logic) */}
      <GameCanvas />
      
      {/* 2. 上層 React UI 互動層 (Tailwind Design) */}
      <GameUI onExit={handleExit} />
    </div>
  );
}
