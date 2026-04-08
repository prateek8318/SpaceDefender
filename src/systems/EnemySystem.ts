// === FILE: src/systems/EnemySystem.ts ===
import { EnemyEntity, Entity, SystemArgs } from '../types/game.types';
import { getLevelConfig } from '../utils/levelConfig';
import { randomRange } from '../utils/physics';
import { COLORS } from '../utils/colors';
import { Enemy } from '../components/Enemy';

export const EnemySystem = (entities: Entity[], { screen, dispatch }: SystemArgs, gameState: any) => {
  const currentTime = Date.now();
  const levelConfig = getLevelConfig(gameState.level);

  if (!gameState.lastEnemySpawnTime || currentTime - gameState.lastEnemySpawnTime > levelConfig.enemyInterval) {
    const enemyTypes = getEnemyWeights(gameState.level);
    const randomType = selectEnemyType(enemyTypes);
    const enemy = createEnemy(randomType, screen.width, gameState.level);
    
    entities.push(enemy);
    gameState.lastEnemySpawnTime = currentTime;
  }

  return entities.filter(entity => {
    if (entity.id.startsWith('enemy')) {
      const enemy = entity as EnemyEntity;
      enemy.y += enemy.speed;
      
      if (enemy.y > screen.height) {
        dispatch({ type: 'life-lost' });
        return false;
      }
      
      return enemy.y < screen.height + enemy.height;
    }
    return true;
  });
};

const getEnemyWeights = (level: number) => {
  const weights = [
    { type: 'basic' as const, weight: 0.6 },
    { type: 'fast' as const, weight: 0.3 },
    { type: 'tank' as const, weight: 0.1 },
  ];

  if (level >= 5 && level % 5 === 0) {
    weights.push({ type: 'boss' as const, weight: 0.05 });
    weights.forEach(w => w.weight *= 0.95);
  }

  return weights;
};

const selectEnemyType = (weights: { type: 'basic' | 'fast' | 'tank' | 'boss', weight: number }[]) => {
  const random = Math.random();
  let cumulative = 0;
  
  for (const weight of weights) {
    cumulative += weight.weight;
    if (random <= cumulative) {
      return weight.type;
    }
  }
  
  return 'basic' as const;
};

const createEnemy = (type: 'basic' | 'fast' | 'tank' | 'boss', screenWidth: number, level: number): EnemyEntity => {
  const baseConfig = {
    basic: { hp: 1, speed: 1, points: 10, width: 30, height: 30 },
    fast: { hp: 1, speed: 2, points: 20, width: 25, height: 35 },
    tank: { hp: 3, speed: 0.5, points: 50, width: 40, height: 40 },
    boss: { hp: 10, speed: 0.3, points: 100, width: 60, height: 60 },
  };

  const config = baseConfig[type];
  const levelConfig = getLevelConfig(level);
  
  return {
    id: `enemy-${Date.now()}-${Math.random()}`,
    x: randomRange(0, screenWidth - config.width),
    y: -config.height,
    width: config.width,
    height: config.height,
    hp: config.hp,
    maxHp: config.hp,
    speed: config.speed * levelConfig.enemySpeed,
    type,
    points: config.points,
    renderer: Enemy,
  };
};
