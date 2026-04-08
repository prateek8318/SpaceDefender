// === FILE: src/utils/levelConfig.ts ===
export interface Level {
  id: number;
  enemyInterval: number;
  enemySpeed: number;
  killsToAdvance: number;
  doubleShot: boolean;
  tripleShot: boolean;
  bossEvery5: boolean;
}

export const LEVELS: Level[] = [
  { id: 1, enemyInterval: 1400, enemySpeed: 0.9, killsToAdvance: 5, doubleShot: false, tripleShot: false, bossEvery5: false },
  { id: 2, enemyInterval: 1300, enemySpeed: 1.0, killsToAdvance: 6, doubleShot: false, tripleShot: false, bossEvery5: false },
  { id: 3, enemyInterval: 1200, enemySpeed: 1.1, killsToAdvance: 7, doubleShot: true, tripleShot: false, bossEvery5: false },
  { id: 4, enemyInterval: 1100, enemySpeed: 1.2, killsToAdvance: 8, doubleShot: true, tripleShot: false, bossEvery5: false },
  { id: 5, enemyInterval: 1000, enemySpeed: 1.3, killsToAdvance: 9, doubleShot: true, tripleShot: false, bossEvery5: true },
  { id: 6, enemyInterval: 900, enemySpeed: 1.4, killsToAdvance: 10, doubleShot: true, tripleShot: true, bossEvery5: false },
  { id: 7, enemyInterval: 800, enemySpeed: 1.6, killsToAdvance: 11, doubleShot: true, tripleShot: true, bossEvery5: false },
  { id: 8, enemyInterval: 700, enemySpeed: 1.8, killsToAdvance: 12, doubleShot: true, tripleShot: true, bossEvery5: false },
  { id: 9, enemyInterval: 600, enemySpeed: 2.1, killsToAdvance: 13, doubleShot: true, tripleShot: true, bossEvery5: false },
  { id: 10, enemyInterval: 500, enemySpeed: 2.5, killsToAdvance: 15, doubleShot: true, tripleShot: true, bossEvery5: true },
];

export const getLevelConfig = (levelId: number): Level => {
  return LEVELS.find(level => level.id === levelId) || LEVELS[0];
};
