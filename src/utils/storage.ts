// === FILE: src/utils/storage.ts ===

export interface ScoreEntry {
  score: number;
  level: number;
  date: string;
}

const LEADERBOARD_KEY = '@space_defender_leaderboard';
const UNLOCKED_LEVEL_KEY = '@space_defender_unlocked_level';
const BEST_SCORE_KEY = '@space_defender_best_score';

// Simple in-memory storage for now
let memoryStorage: { [key: string]: string } = {};

const getItem = async (key: string): Promise<string | null> => {
  try {
    return memoryStorage[key] || null;
  } catch (error) {
    console.error('Error getting item:', error);
    return memoryStorage[key] || null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    memoryStorage[key] = value;
  } catch (error) {
    console.error('Error setting item:', error);
    memoryStorage[key] = value;
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    delete memoryStorage[key];
  } catch (error) {
    console.error('Error removing item:', error);
    delete memoryStorage[key];
  }
};

export const saveScore = async (score: number, level: number): Promise<void> => {
  try {
    const existingScores = await getLeaderboard();
    const newEntry: ScoreEntry = {
      score,
      level,
      date: new Date().toISOString(),
    };
    
    const updatedScores = [...existingScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    await setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
    
    const bestScore = await getBestScore();
    if (score > bestScore) {
      await setItem(BEST_SCORE_KEY, JSON.stringify(score));
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
  try {
    const scores = await getItem(LEADERBOARD_KEY);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

export const clearLeaderboard = async (): Promise<void> => {
  try {
    await removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
};

export const saveUnlockedLevel = async (levelId: number): Promise<void> => {
  try {
    await setItem(UNLOCKED_LEVEL_KEY, JSON.stringify(levelId));
  } catch (error) {
    console.error('Error saving unlocked level:', error);
  }
};

export const getUnlockedLevel = async (): Promise<number> => {
  try {
    const level = await getItem(UNLOCKED_LEVEL_KEY);
    return level ? JSON.parse(level) : 1;
  } catch (error) {
    console.error('Error getting unlocked level:', error);
    return 1;
  }
};

export const getBestScore = async (): Promise<number> => {
  try {
    const score = await getItem(BEST_SCORE_KEY);
    return score ? JSON.parse(score) : 0;
  } catch (error) {
    console.error('Error getting best score:', error);
    return 0;
  }
};
