// === FILE: src/hooks/useHighScore.ts ===
import { useState, useEffect } from 'react';
import { getBestScore } from '../utils/storage';

export const useHighScore = () => {
  const [bestScore, setBestScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBestScore = async () => {
      try {
        const score = await getBestScore();
        setBestScore(score);
      } catch (error) {
        console.error('Error loading best score:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBestScore();
  }, []);

  const refreshBestScore = async () => {
    try {
      const score = await getBestScore();
      setBestScore(score);
    } catch (error) {
      console.error('Error refreshing best score:', error);
    }
  };

  return { bestScore, loading, refreshBestScore };
};
