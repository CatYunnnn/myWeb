import { create } from 'zustand';

interface GameState {
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  health: number;
  level: number;
  exp: number;
  expToNext: number;
  
  // Actions
  togglePause: () => void;
  setPause: (paused: boolean) => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  addExp: (amount: number) => void;
  gameOver: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  isGameOver: false,
  score: 0,
  health: 100,
  level: 1,
  exp: 0,
  expToNext: 50,

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPause: (paused) => set({ isPaused: paused }),
  setScore: (score) => set({ score }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setHealth: (health) => set({ health: Math.max(0, Math.min(100, health)) }),
  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    return { 
      health: newHealth,
      isGameOver: newHealth <= 0,
    };
  }),
  addExp: (amount) => set((state) => {
    let newExp = state.exp + amount;
    let newLevel = state.level;
    let newExpToNext = state.expToNext;

    // 處理連續升級（溢出的經驗值累計）
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel += 1;
      newExpToNext = newLevel * 50;
    }

    return {
      exp: newExp,
      level: newLevel,
      expToNext: newExpToNext,
    };
  }),
  gameOver: () => set({ isGameOver: true }),
  resetGame: () => set({ 
    score: 0, 
    health: 100, 
    isPaused: false, 
    isGameOver: false,
    level: 1,
    exp: 0,
    expToNext: 50,
  }),
}));
