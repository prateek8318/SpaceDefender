// === FILE: src/utils/storage.ts ===

export interface ScoreEntry {
  score: number;
  level: number;
  date: string;
}

const LEADERBOARD_KEY = '@space_defender_leaderboard';
const UNLOCKED_LEVEL_KEY = '@space_defender_unlocked_level';
const BEST_SCORE_KEY = '@space_defender_best_score';

// Fallback to memory storage due to AsyncStorage native module issues
// In production, this should be replaced with proper AsyncStorage setup
let memoryStorage: { [key: string]: string } = {};

const getItem = async (key: string): Promise<string | null> => {
  try {
    // Try AsyncStorage first
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (asyncError) {
      // Fallback to memory storage
      console.log('AsyncStorage not available, using memory storage');
      return memoryStorage[key] || null;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    return memoryStorage[key] || null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    // Try AsyncStorage first
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (asyncError) {
      // Fallback to memory storage
      console.log('AsyncStorage not available, using memory storage');
      memoryStorage[key] = value;
    }
  } catch (error) {
    console.error('Error setting item:', error);
    memoryStorage[key] = value;
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    // Try AsyncStorage first
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (asyncError) {
      // Fallback to memory storage
      console.log('AsyncStorage not available, using memory storage');
      delete memoryStorage[key];
    }
  } catch (error) {
    console.error('Error removing item:', error);
    delete memoryStorage[key];
  }
};

export const saveScore = async (score: number, level: number): Promise<void> => {
  try {
    console.log('saveScore called with:', { score, level });
    const existingScores = await getLeaderboard();
    console.log('Existing scores:', existingScores);
    
    const newEntry: ScoreEntry = {
      score,
      level,
      date: new Date().toISOString(),
    };
    
    const updatedScores = [...existingScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    console.log('Updated scores:', updatedScores);
    await setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
    
    const bestScore = await getBestScore();
    console.log('Current best score:', bestScore, 'New score:', score);
    if (score > bestScore) {
      console.log('New best score! Saving:', score);
      await setItem(BEST_SCORE_KEY, JSON.stringify(score));
    }
    
    console.log('Score save completed successfully');
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
  try {
    const scores = await getItem(LEADERBOARD_KEY);
    console.log('getLeaderboard - raw scores:', scores);
    const parsed = scores ? JSON.parse(scores) : [];
    console.log('getLeaderboard - parsed scores:', parsed);
    return parsed;
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
    console.log('getBestScore - raw score:', score);
    const parsed = score ? JSON.parse(score) : 0;
    console.log('getBestScore - parsed score:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error getting best score:', error);
    return 0;
  }
};
