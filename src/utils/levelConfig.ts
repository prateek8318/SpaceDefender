// === FILE: src/utils/levelConfig.ts ===
export interface Level {
  id: number;
  enemyInterval: number;
  enemySpeed: number;
  killsToAdvance: number;
  doubleShot: boolean;
  tripleShot: boolean;
  bossEvery5: boolean;
  availableMovements: ('linear' | 'zigzag' | 'dive' | 'spiral')[];
}

export const LEVELS: Level[] = Array.from({ length: 500 }, (_, index) => {
  const levelId = index + 1;
  const isBossLevel = levelId % 5 === 0;
  const stageRamp = Math.floor((levelId - 1) / 5);
  const bossModifier = isBossLevel ? 0.76 : 1;

  const baseInterval = Math.max(250, (1200 - levelId * 7 - stageRamp * 15) * (isBossLevel ? 0.85 : 1));
  const baseSpeed = Math.min(6.5, 1.0 + levelId * 0.05 + stageRamp * 0.12 + (isBossLevel ? 0.5 : 0));
  const baseKills = Math.min(50, 5 + Math.floor(levelId / 3) + (isBossLevel ? 2 : 0));

  const doubleShot = levelId >= 3;
  const tripleShot = levelId >= 6;

  const availableMovements: ('linear' | 'zigzag' | 'dive' | 'spiral')[] = ['linear'];
  if (levelId >= 3) availableMovements.push('zigzag');
  if (levelId >= 10) availableMovements.push('dive');
  if (levelId >= 15) availableMovements.push('spiral');

  return {
    id: levelId,
    enemyInterval: baseInterval,
    enemySpeed: baseSpeed,
    killsToAdvance: baseKills,
    doubleShot: doubleShot,
    tripleShot: tripleShot,
    bossEvery5: isBossLevel,
    availableMovements,
  };
});

export const getLevelConfig = (levelId: number): Level => {
  return LEVELS.find(level => level.id === levelId) || LEVELS[0];
};
