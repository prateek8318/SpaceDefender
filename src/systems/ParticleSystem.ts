// === FILE: src/systems/ParticleSystem.ts ===
import { ParticleEntity } from '../types/game.types';

export const ParticleSystem = (entities: ParticleEntity[]) => {
  return entities
    .filter(particle => particle.life > 0)
    .map(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      return particle;
    });
};
