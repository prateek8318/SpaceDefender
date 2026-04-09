// === FILE: src/systems/CollisionSystem.ts ===
import { BulletEntity, EnemyEntity, ParticleEntity, Entity, SystemArgs } from '../types/game.types';
import { circleCollision, randomRange } from '../utils/physics';
import { COLORS } from '../utils/colors';
import { Particle } from '../components/Particle';

export const CollisionSystem = (entities: Entity[], { dispatch }: SystemArgs, gameState: any) => {
  const bullets = entities.filter(e => e.id.startsWith('bullet')) as BulletEntity[];
  const enemies = entities.filter(e => e.id.startsWith('enemy')) as EnemyEntity[];
  const player = entities.find(e => e.id === 'player');
  
  const particles: ParticleEntity[] = [];
  const remainingBullets: BulletEntity[] = [];
  const remainingEnemies: EnemyEntity[] = [];

  bullets.forEach(bullet => {
    let hit = false;
    
    enemies.forEach(enemy => {
      if (!hit && circleCollision(
        { x: bullet.x + bullet.width / 2, y: bullet.y + bullet.height / 2 },
        { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2 },
        bullet.width / 2,
        enemy.width / 2
      )) {
        hit = true;
        enemy.hp--;
        
        if (enemy.hp <= 0) {
          dispatch({ type: 'enemy-killed', points: enemy.points });
          
          const explosionParticles = createExplosionParticles(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            enemy.type === 'boss' ? COLORS.purple : 
            enemy.type === 'tank' ? COLORS.purple :
            enemy.type === 'fast' ? COLORS.accent : COLORS.danger
          );
          particles.push(...explosionParticles);
          
          dispatch({ type: 'play-explosion' });
        } else {
          const hitParticles = createHitParticles(
            bullet.x + bullet.width / 2,
            bullet.y + bullet.height / 2,
            COLORS.accent
          );
          particles.push(...hitParticles);
        }
      }
    });
    
    if (!hit) {
      remainingBullets.push(bullet);
    }
  });

  enemies.forEach(enemy => {
    if (enemy.hp > 0) {
      remainingEnemies.push(enemy);
      
      if (player && circleCollision(
        { x: player.x + player.width / 2, y: player.y + player.height / 2 },
        { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2 },
        player.width / 2,
        enemy.width / 2
      )) {
        dispatch({ type: 'life-lost' });
        enemy.hp = 0;
        
        const explosionParticles = createExplosionParticles(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          COLORS.danger
        );
        particles.push(...explosionParticles);
        
        dispatch({ type: 'play-explosion' });
      }
    }
  });

  const otherEntities = entities.filter(e => 
    !e.id.startsWith('bullet') && 
    !e.id.startsWith('enemy') && 
    e.id !== 'player'
  ) as ParticleEntity[];

  return [...remainingBullets, ...remainingEnemies, ...otherEntities, ...particles];
};

const createExplosionParticles = (x: number, y: number, color: string): ParticleEntity[] => {
  const particles: ParticleEntity[] = [];
  const count = 12;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = randomRange(2, 5);
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      x: x,
      y: y,
      width: 4,
      height: 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color,
      renderer: Particle,
    });
  }
  
  return particles;
};

const createHitParticles = (x: number, y: number, color: string): ParticleEntity[] => {
  const particles: ParticleEntity[] = [];
  const count = 4;
  
  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(1, 3);
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      x: x,
      y: y,
      width: 3,
      height: 3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5,
      color,
      renderer: Particle,
    });
  }
  
  return particles;
};
