// === FILE: src/hooks/useGameState.ts ===
import { useCallback, useRef, useState } from 'react';
import { GameState, PerkType, WeaponType, PowerUpType } from '../types/game.types';
import { getLevelConfig } from '../utils/levelConfig';

export const useGameState = (initialLevel: number = 1) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: initialLevel,
    status: 'idle',
    kills: 0,
    timeElapsed: 0,
    lastEnemySpawnTime: 0,
    lastBulletTime: 0,
    shieldActive: false,
    lifelineUsed: false,
    combo: 0,
    multiplier: 1,
    activePowerUp: null,
    powerUpTime: 0,
    activePerk: null,
    activeWeapon: 'standard',
  });

  const lastBulletTime = useRef<number>(0);
  const lastEnemySpawnTime = useRef<number>(0);
  const startTime = useRef<number>(0);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points * prev.multiplier }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      if (prev.shieldActive) return prev; // Shield protects from losing life
      const newLives = Math.max(0, prev.lives - 1);
      return {
        ...prev,
        lives: newLives,
        combo: 0,
        multiplier: 1,
        status: newLives === 0 ? 'over' : prev.status,
      };
    });
  }, []);

  const addKill = useCallback(() => {
    setGameState(prev => {
      const newKills = prev.kills + 1;
      const levelConfig = getLevelConfig(prev.level);

      if (newKills >= levelConfig.killsToAdvance) {
        const newLevel = Math.min(prev.level + 1, 500);
        if (newLevel > prev.level) {
          import('../utils/storage').then(({ saveUnlockedLevel }) => {
            saveUnlockedLevel(newLevel);
          });
        }
        
        return {
          ...prev,
          status: 'cleared',
          lifelineUsed: false,
        };
      }
      
      const newCombo = prev.combo + 1;
      let newMultiplier = 1;
      if (newCombo >= 30) newMultiplier = 8;
      else if (newCombo >= 15) newMultiplier = 4;
      else if (newCombo >= 5) newMultiplier = 2;

      return { ...prev, kills: newKills, combo: newCombo, multiplier: newMultiplier };
    });
  }, []);

  const startGame = useCallback(() => {
    startTime.current = Date.now();
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      lives: 3,
      kills: 0,
      timeElapsed: 0,
      lastEnemySpawnTime: 0,
      lastBulletTime: 0,
      shieldActive: false,
      lifelineUsed: false,
      combo: 0,
      multiplier: 1,
      activePowerUp: null,
      powerUpTime: 0,
    }));
  }, []);

  const setPerk = useCallback((perk: PerkType) => {
    setGameState(prev => {
      let extraLives = 0;
      if (perk === 'extraLife') extraLives = 1;
      if (perk === 'doubleCoins') return { ...prev, activePerk: perk, lives: 1 };
      
      return { 
        ...prev, 
        activePerk: perk,
        lives: Math.min(5, prev.lives + extraLives)
      };
    });
  }, []);

  const setWeapon = useCallback((weapon: WeaponType) => {
    setGameState(prev => ({ ...prev, activeWeapon: weapon }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const gameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'over' }));
  }, []);

  const reset = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      level: initialLevel,
      status: 'idle',
      kills: 0,
      timeElapsed: 0,
      lastEnemySpawnTime: 0,
      lastBulletTime: 0,
      shieldActive: false,
      lifelineUsed: false,
      combo: 0,
      multiplier: 1,
      activePowerUp: null,
      powerUpTime: 0,
      activeWeapon: 'standard',
      activePerk: null,
    });
    lastBulletTime.current = 0;
    lastEnemySpawnTime.current = 0;
    startTime.current = 0;
  }, [initialLevel]);

  const updateTime = useCallback(() => {
    setGameState(prev => {
      if (prev.status === 'playing' && startTime.current > 0) {
        const nextPowerUpTime = Math.max(0, prev.powerUpTime - (Date.now() - (startTime.current + prev.timeElapsed)));
        return {
          ...prev,
          timeElapsed: Date.now() - startTime.current,
          powerUpTime: nextPowerUpTime,
          activePowerUp: nextPowerUpTime <= 0 ? null : prev.activePowerUp,
        };
      }
      return prev;
    });
  }, []);

  const shieldTimeoutRef = useRef<any>(null);

  const activateShield = useCallback(() => {
    setGameState(prev => {
      if (prev.lifelineUsed || prev.status !== 'playing') return prev;
      
      if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
      
      shieldTimeoutRef.current = setTimeout(() => {
        setGameState(current => ({ ...current, shieldActive: false }));
        shieldTimeoutRef.current = null;
      }, 5000);

      return {
        ...prev,
        shieldActive: true,
        lifelineUsed: true,
      };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: Math.min(prev.level + 1, 500),
      status: 'playing',
      kills: 0,
    }));
  }, []);

  const revive = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lives: 1,
      status: 'playing',
    }));
  }, []);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    setGameState(prev => {
      if (type === 'shieldRecharge') {
        return {
          ...prev,
          lives: Math.min(3, prev.lives + 1),
        };
      }

      let duration = 0;
      switch (type) {
        case 'rapidFire': duration = 8000; break;
        case 'multiShot': duration = 10000; break;
        case 'timeSlow': duration = 6000; break;
        case 'shieldRefill': 
        case 'bombRefill':
          duration = 0;
          break;
      }

      if (duration === 0 && type !== 'shieldRecharge') {
        return prev;
      }

      return {
        ...prev,
        activePowerUp: type,
        powerUpTime: duration,
      };
    });
  }, []);

  return {
    gameState: {
      ...gameState,
      lastBulletTime: lastBulletTime.current,
      lastEnemySpawnTime: lastEnemySpawnTime.current,
    },
    updateScore,
    loseLife,
    addKill,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    reset,
    updateTime,
    activateShield,
    activatePowerUp,
    revive,
    nextLevel,
    setPerk,
    setWeapon,
  };
};
