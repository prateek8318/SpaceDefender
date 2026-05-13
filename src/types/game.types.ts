// === FILE: src/types/game.types.ts ===
import React from 'react';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  renderer?: React.FC<any>;
}

export type SkinType = 'scout' | 'vanguard' | 'phoenix' | 'phantom' | 'omega';

export type PowerUpType = 
  | 'rapidFire' 
  | 'multiShot' 
  | 'timeSlow' 
  | 'shieldRecharge' 
  | 'shieldRefill' 
  | 'bombRefill';

export type PerkType = 
  | 'pierce' 
  | 'autoShield' 
  | 'doubleCoins' 
  | 'luckyDrop' 
  | 'autoBomb' 
  | 'speed' 
  | 'alwaysMulti' 
  | 'freeze' 
  | 'scoreX2' 
  | 'extraLife' 
  | 'largeBullets' 
  | 'alwaysRapid';

export type WeaponType = 'standard' | 'laser' | 'shotgun' | 'sniper';

export interface Weapon {
  id: WeaponType;
  name: string;
  description: string;
  icon: string;
  damageMult: number;
  fireRateMult: number;
}

export interface Perk {
  id: PerkType;
  name: string;
  description: string;
  icon: string;
}

export type MovementType = 'linear' | 'zigzag' | 'dive' | 'spiral';

export interface PowerUpModel {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  drift: number;
  phase: number;
  movementType?: MovementType;
  targetX?: number;
  startTime?: number;
}

export interface PlayerEntity extends Entity {
  speed: number;
  lives: number;
  skin: SkinType;
}

export interface EnemyEntity extends Entity {
  hp: number;
  maxHp: number;
  shield?: number;
  maxShield?: number;
  frozen?: number;
  speed: number;
  type: 'basic' | 'fast' | 'tank' | 'boss';
  points: number;
}

export interface BulletEntity extends Entity {
  vx: number;
  vy: number;
}

export interface ParticleEntity extends Entity {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

export interface GameState {
  score: number;
  lives: number;
  level: number;
  status: GameStatus;
  kills: number;
  timeElapsed: number;
  lastEnemySpawnTime: number;
  lastBulletTime: number;
  shieldActive: boolean;
  lifelineUsed: boolean;
  combo: number;
  multiplier: number;
  activePowerUp: PowerUpType | null;
  powerUpTime: number; // in milliseconds
  activePerk: PerkType | null;
  activeWeapon: WeaponType;
}

export interface GameEngineProps {
  systems: any[];
  entities: Entity[];
  style?: any;
  onEvent?: (event: any) => void;
}

export interface SystemArgs {
  touches: any[];
  screen: { width: number; height: number };
  events: any[];
  dispatch: (event: any) => void;
}

export interface GameEvent {
  type: string;
  payload?: any;
}

export interface Position {
  x: number;
  y: number;
}

export interface EnemySpawnConfig {
  type: 'basic' | 'fast' | 'tank' | 'boss';
  weight: number;
}

export interface ParticleConfig {
  x: number;
  y: number;
  color: string;
  count: number;
  speed: number;
}
