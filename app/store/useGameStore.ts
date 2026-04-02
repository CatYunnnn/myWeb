import { create } from 'zustand';

interface GameState {
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  health: number;
  
  // Actions
  togglePause: () => void;
  setPause: (paused: boolean) => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  gameOver: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  isGameOver: false,
  score: 0,
  health: 100,

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
  gameOver: () => set({ isGameOver: true }),
  resetGame: () => set({ score: 0, health: 100, isPaused: false, isGameOver: false }),
}));
