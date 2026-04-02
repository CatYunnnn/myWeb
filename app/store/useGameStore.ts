import { create } from "zustand";

// ══════════════════════════════════
// 型別定義
// ══════════════════════════════════

export interface WeaponStats {
  damage: number;          // 單發傷害，初始 10
  projectileCount: number; // 子彈數量，初始 1
  pierceCount: number;     // 穿透次數，初始 0
  fireInterval: number;    // 射擊間隔 ms，初始 500
  bulletRadius: number;    // 子彈半徑，初始 6
  maxHealth: number;       // 最大血量，初始 100
  lerpSpeed: number;       // 移動緩動係數，初始 0.1
}

export type Rarity = 'common' | 'rare' | 'epic';

export interface UpgradeOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: Rarity;
}

// ══════════════════════════════════
// 升級能力池定義
// ══════════════════════════════════

interface UpgradeDefinition {
  id: string;
  name: string;
  icon: string;
  getDescription: (rarity: Rarity) => string;
  apply: (stats: WeaponStats, rarity: Rarity) => Partial<WeaponStats> & { heal?: number };
  canApply: (stats: WeaponStats) => boolean;
}

const RARITY_MULTIPLIER: Record<Rarity, number> = {
  common: 1,
  rare: 1.5,
  epic: 2,
};

const UPGRADE_POOL: UpgradeDefinition[] = [
  {
    id: 'dmg_up',
    name: '火力強化',
    icon: '🔥',
    getDescription: (r) => `單發傷害 +${Math.round(5 * RARITY_MULTIPLIER[r])}`,
    apply: (stats, r) => ({ damage: stats.damage + Math.round(5 * RARITY_MULTIPLIER[r]) }),
    canApply: () => true,
  },
  {
    id: 'multi_shot',
    name: '多重射擊',
    icon: '🔱',
    getDescription: (r) => `子彈數量 +${r === 'epic' ? 2 : 1}`,
    apply: (stats, r) => ({
      projectileCount: Math.min(5, stats.projectileCount + (r === 'epic' ? 2 : 1)),
    }),
    canApply: (stats) => stats.projectileCount < 5,
  },
  {
    id: 'pierce',
    name: '穿透射擊',
    icon: '💎',
    getDescription: (r) => `穿透敵人 +${r === 'epic' ? 2 : 1}`,
    apply: (stats, r) => ({
      pierceCount: Math.min(3, stats.pierceCount + (r === 'epic' ? 2 : 1)),
    }),
    canApply: (stats) => stats.pierceCount < 3,
  },
  {
    id: 'fire_rate',
    name: '攻速提升',
    icon: '⚡',
    getDescription: (r) => `射擊間隔 -${Math.round(50 * RARITY_MULTIPLIER[r])}ms`,
    apply: (stats, r) => ({
      fireInterval: Math.max(150, stats.fireInterval - Math.round(50 * RARITY_MULTIPLIER[r])),
    }),
    canApply: (stats) => stats.fireInterval > 150,
  },
  {
    id: 'heal',
    name: '生命回復',
    icon: '💚',
    getDescription: (r) => `立即回復 ${Math.round(20 * RARITY_MULTIPLIER[r])} HP`,
    apply: (_stats, r) => ({ heal: Math.round(20 * RARITY_MULTIPLIER[r]) }),
    canApply: () => true,
  },
  {
    id: 'max_hp',
    name: '生命上限',
    icon: '🛡️',
    getDescription: (r) => `最大 HP +${Math.round(20 * RARITY_MULTIPLIER[r])}`,
    apply: (stats, r) => ({
      maxHealth: stats.maxHealth + Math.round(20 * RARITY_MULTIPLIER[r]),
    }),
    canApply: () => true,
  },
  {
    id: 'speed_up',
    name: '移速提升',
    icon: '👟',
    getDescription: (r) => `移動速度 +${r === 'epic' ? '大幅' : r === 'rare' ? '中幅' : '小幅'}提升`,
    apply: (stats, r) => ({
      lerpSpeed: Math.min(0.2, stats.lerpSpeed + 0.02 * RARITY_MULTIPLIER[r]),
    }),
    canApply: (stats) => stats.lerpSpeed < 0.2,
  },
  {
    id: 'bullet_size',
    name: '彈幕擴大',
    icon: '💥',
    getDescription: (r) => `子彈半徑 +${Math.round(2 * RARITY_MULTIPLIER[r])}`,
    apply: (stats, r) => ({
      bulletRadius: Math.min(16, stats.bulletRadius + Math.round(2 * RARITY_MULTIPLIER[r])),
    }),
    canApply: (stats) => stats.bulletRadius < 16,
  },
];

// ══════════════════════════════════
// 隨機選項生成
// ══════════════════════════════════

function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll < 0.10) return 'epic';
  if (roll < 0.40) return 'rare';
  return 'common';
}

function generateUpgradeOptions(stats: WeaponStats): UpgradeOption[] {
  // 過濾掉已達上限的能力
  const available = UPGRADE_POOL.filter(u => u.canApply(stats));
  
  // 隨機洗牌後取 3 個
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  return picked.map(def => {
    const rarity = rollRarity();
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      description: def.getDescription(rarity),
      rarity,
    };
  });
}

// ══════════════════════════════════
// 初始數值
// ══════════════════════════════════

const INITIAL_WEAPON_STATS: WeaponStats = {
  damage: 10,
  projectileCount: 1,
  pierceCount: 0,
  fireInterval: 500,
  bulletRadius: 6,
  maxHealth: 100,
  lerpSpeed: 0.1,
};

// ══════════════════════════════════
// Store 定義
// ══════════════════════════════════

interface GameState {
  isPaused: boolean;
  isGameOver: boolean;
  isUpgrading: boolean;
  score: number;
  health: number;
  level: number;
  exp: number;
  expToNext: number;
  weaponStats: WeaponStats;
  pendingUpgrades: UpgradeOption[];

  // Actions
  togglePause: () => void;
  setPause: (paused: boolean) => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  addExp: (amount: number) => void;
  triggerUpgrade: () => void;
  selectUpgrade: (id: string) => void;
  gameOver: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isPaused: false,
  isGameOver: false,
  isUpgrading: false,
  score: 0,
  health: 100,
  level: 1,
  exp: 0,
  expToNext: 50,
  weaponStats: { ...INITIAL_WEAPON_STATS },
  pendingUpgrades: [],

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPause: (paused) => set({ isPaused: paused }),
  setScore: (score) => set({ score }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setHealth: (health) => set((state) => ({ 
    health: Math.max(0, Math.min(state.weaponStats.maxHealth, health)) 
  })),
  takeDamage: (amount) =>
    set((state) => {
      const newHealth = Math.max(0, state.health - amount);
      return {
        health: newHealth,
        isGameOver: newHealth <= 0,
      };
    }),
  addExp: (amount) => {
    const state = get();
    let newExp = state.exp + amount;
    let newLevel = state.level;
    let newExpToNext = state.expToNext;
    let shouldUpgrade = false;

    // 處理連續升級（溢出的經驗值累計）
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel += 1;
      newExpToNext = newLevel * 50;

      // 每 5 級觸發一次升級
      if (newLevel % 5 === 0) {
        shouldUpgrade = true;
      }
    }

    set({
      exp: newExp,
      level: newLevel,
      expToNext: newExpToNext,
    });

    if (shouldUpgrade) {
      get().triggerUpgrade();
    }
  },
  triggerUpgrade: () => {
    const state = get();
    const options = generateUpgradeOptions(state.weaponStats);
    set({ isUpgrading: true, pendingUpgrades: options });
  },
  selectUpgrade: (id: string) => {
    const state = get();
    const chosen = state.pendingUpgrades.find(u => u.id === id);
    if (!chosen) return;

    const def = UPGRADE_POOL.find(u => u.id === chosen.id);
    if (!def) return;

    const result = def.apply(state.weaponStats, chosen.rarity);
    const { heal, ...statChanges } = result as Partial<WeaponStats> & { heal?: number };

    const newStats = { ...state.weaponStats, ...statChanges };
    
    let newHealth = state.health;
    if (heal) {
      newHealth = Math.min(newStats.maxHealth, state.health + heal);
    }
    if (statChanges.maxHealth && statChanges.maxHealth > state.weaponStats.maxHealth) {
      const hpDiff = statChanges.maxHealth - state.weaponStats.maxHealth;
      newHealth = Math.min(newStats.maxHealth, newHealth + hpDiff);
    }

    set({
      weaponStats: newStats,
      health: newHealth,
      isUpgrading: false,
      pendingUpgrades: [],
    });
  },
  gameOver: () => set({ isGameOver: true }),
  resetGame: () =>
    set({
      score: 0,
      health: 100,
      isPaused: false,
      isGameOver: false,
      isUpgrading: false,
      level: 1,
      exp: 0,
      expToNext: 50,
      weaponStats: { ...INITIAL_WEAPON_STATS },
      pendingUpgrades: [],
    }),
}));
