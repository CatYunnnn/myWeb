import { create } from 'zustand';

interface GameState {
  isPaused: boolean;
  score: number;
  health: number;
  
  // Actions
  togglePause: () => void;
  setPause: (paused: boolean) => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  score: 0,
  health: 100,

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPause: (paused) => set({ isPaused: paused }),
  setScore: (score) => set({ score }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setHealth: (health) => set({ health: Math.max(0, Math.min(100, health)) }),
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  resetGame: () => set({ score: 0, health: 100, isPaused: false }),
}));
