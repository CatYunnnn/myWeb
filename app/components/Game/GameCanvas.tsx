"use client";
import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './GameEngine';
import { useGameStore } from '../../store/useGameStore';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isPaused = useGameStore(state => state.isPaused);
  const isGameOver = useGameStore(state => state.isGameOver);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 初始化引擎
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // 處理視窗大小改變
    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 觸發一次拿到初始大小
    
    engine.start();
    setIsReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 監聽 React 傳來的暫停 / 遊戲結束狀態來控制底層引擎
  useEffect(() => {
    if (!engineRef.current || !isReady) return;
    if (isPaused || isGameOver) {
      engineRef.current.stop();
    } else {
      // 如果從 Game Over 回來，先重置引擎
      engineRef.current.reset();
      engineRef.current.start();
    }
  }, [isPaused, isGameOver, isReady]);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full bg-slate-950 cursor-crosshair touch-none"
    />
  );
}
