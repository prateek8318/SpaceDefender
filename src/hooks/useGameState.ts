// === FILE: src/hooks/useGameState.ts ===
import { useCallback, useRef, useState } from 'react';
import { GameState } from '../types/game.types';
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
  });

  const lastBulletTime = useRef<number>(0);
  const lastEnemySpawnTime = useRef<number>(0);
  const startTime = useRef<number>(0);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = Math.max(0, prev.lives - 1);
      return {
        ...prev,
        lives: newLives,
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
          kills: 0,
          level: newLevel,
        };
      }
      
      return { ...prev, kills: newKills };
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
    }));
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
    });
    lastBulletTime.current = 0;
    lastEnemySpawnTime.current = 0;
    startTime.current = 0;
  }, [initialLevel]);

  const updateTime = useCallback(() => {
    setGameState(prev => {
      if (prev.status === 'playing' && startTime.current > 0) {
        return {
          ...prev,
          timeElapsed: Date.now() - startTime.current,
        };
      }
      return prev;
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
  };
};
