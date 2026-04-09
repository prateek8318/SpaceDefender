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

export interface PlayerEntity extends Entity {
  speed: number;
  lives: number;
}

export interface EnemyEntity extends Entity {
  hp: number;
  maxHp: number;
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
