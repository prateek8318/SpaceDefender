// === FILE: src/systems/BulletSystem.ts ===
import { BulletEntity, Entity, SystemArgs } from '../types/game.types';
import { getLevelConfig } from '../utils/levelConfig';
import { Bullet } from '../components/Bullet';

export const BulletSystem = (entities: Entity[], { screen, dispatch }: SystemArgs, gameState: any) => {
  const currentTime = Date.now();
  const levelConfig = getLevelConfig(gameState.level);
  const fireInterval = gameState.level >= 5 ? 220 : 300;

  if (!gameState.lastBulletTime || currentTime - gameState.lastBulletTime > fireInterval) {
    const player = entities.find(entity => entity.id === 'player');
    if (player) {
      const bullets: BulletEntity[] = [];
      
      if (levelConfig.tripleShot) {
        bullets.push(
          {
            id: `bullet-${currentTime}-1`,
            x: player.x - 10,
            y: player.y,
            width: 4,
            height: 12,
            vx: 0,
            vy: -8,
            renderer: Bullet,
          },
          {
            id: `bullet-${currentTime}-2`,
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 12,
            vx: 0,
            vy: -8,
            renderer: Bullet,
          },
          {
            id: `bullet-${currentTime}-3`,
            x: player.x + player.width + 6,
            y: player.y,
            width: 4,
            height: 12,
            vx: 0,
            vy: -8,
            renderer: Bullet,
          }
        );
      } else if (levelConfig.doubleShot) {
        bullets.push(
          {
            id: `bullet-${currentTime}-1`,
            x: player.x + 5,
            y: player.y,
            width: 4,
            height: 12,
            vx: 0,
            vy: -8,
            renderer: Bullet,
          },
          {
            id: `bullet-${currentTime}-2`,
            x: player.x + player.width - 9,
            y: player.y,
            width: 4,
            height: 12,
            vx: 0,
            vy: -8,
            renderer: Bullet,
          }
        );
      } else {
        bullets.push({
          id: `bullet-${currentTime}`,
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 12,
          vx: 0,
          vy: -8,
          renderer: Bullet,
        });
      }

      bullets.forEach(bullet => {
        entities.push(bullet);
      });

      gameState.lastBulletTime = currentTime;
      dispatch({ type: 'play-shoot' });
    }
  }

  return entities.filter(entity => {
    if (entity.id.startsWith('bullet')) {
      const bullet = entity as BulletEntity;
      bullet.y += bullet.vy;
      return bullet.y > -bullet.height;
    }
    return true;
  });
};
