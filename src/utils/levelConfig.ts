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

export const LEVELS: Level[] = Array.from({ length: 500 }, (_, index) => {
  const levelId = index + 1;
  const isBossLevel = levelId % 5 === 0;
  
  // Progressive difficulty scaling
  const baseInterval = Math.max(200, 1400 - (levelId * 2.4)); // Decreases from 1400 to 200
  const baseSpeed = Math.min(5.0, 0.9 + (levelId * 0.0082)); // Increases from 0.9 to 5.0
  const baseKills = Math.min(50, 5 + Math.floor(levelId / 10)); // Increases from 5 to 50
  
  // Power-ups unlock at specific levels
  const doubleShot = levelId >= 3;
  const tripleShot = levelId >= 6;
  
  return {
    id: levelId,
    enemyInterval: baseInterval,
    enemySpeed: baseSpeed,
    killsToAdvance: baseKills,
    doubleShot: doubleShot,
    tripleShot: tripleShot,
    bossEvery5: isBossLevel,
  };
});

export const getLevelConfig = (levelId: number): Level => {
  return LEVELS.find(level => level.id === levelId) || LEVELS[0];
};
