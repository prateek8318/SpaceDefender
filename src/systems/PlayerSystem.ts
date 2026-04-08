// === FILE: src/systems/PlayerSystem.ts ===
import { PlayerEntity, Entity, SystemArgs } from '../types/game.types';
import { clamp } from '../utils/physics';
import { wp } from '../utils/responsive';

export const PlayerSystem = (entities: Entity[], { touches, screen }: SystemArgs) => {
  touches.forEach(touch => {
    if (touch.type === 'move') {
      const player = entities.find(entity => entity.id === 'player') as PlayerEntity;
      if (player) {
        const deltaX = touch.delta.pageX || 0;
        const newX = clamp(player.x + deltaX, 0, screen.width - player.width);
        player.x = newX;
      }
    }
  });

  return entities;
};
