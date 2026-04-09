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
  const stageRamp = Math.floor((levelId - 1) / 5);
  const bossModifier = isBossLevel ? 0.76 : 1;

  const baseInterval = Math.max(170, (1200 - levelId * 10 - stageRamp * 22) * bossModifier);
  const baseSpeed = Math.min(8.8, 1.15 + levelId * 0.085 + stageRamp * 0.18 + (isBossLevel ? 0.85 : 0));
  const baseKills = Math.min(70, 5 + Math.floor(levelId / 2) + (isBossLevel ? 3 : 0));

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
