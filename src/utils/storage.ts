// === FILE: src/utils/storage.ts ===

import RNFS from 'react-native-fs';

const STORAGE_DIR = RNFS.DocumentDirectoryPath;
const STORAGE_FILE = `${STORAGE_DIR}/game_data.json`;

interface StorageData {
  [key: string]: string;
}

let memoryStorage: StorageData = {};

const loadStorage = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(STORAGE_FILE);
    if (exists) {
      const data = await RNFS.readFile(STORAGE_FILE, 'utf8');
      memoryStorage = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading storage:', error);
  }
};

const saveStorage = async (): Promise<void> => {
  try {
    await RNFS.writeFile(STORAGE_FILE, JSON.stringify(memoryStorage), 'utf8');
  } catch (error) {
    console.error('Error saving storage:', error);
  }
};

// Load storage on module load
loadStorage();

export interface ScoreEntry {
  score: number;
  level: number;
  date: string;
}

const LEADERBOARD_KEY = '@space_defender_leaderboard';
const UNLOCKED_LEVEL_KEY = '@space_defender_unlocked_level';
const BEST_SCORE_KEY = '@space_defender_best_score';

const getItem = async (key: string): Promise<string | null> => {
  try {
    return memoryStorage[key] || null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    memoryStorage[key] = value;
    await saveStorage(); // Save to file immediately
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    delete memoryStorage[key];
    await saveStorage();
  } catch (error) {
    console.error('Error removing item:', error);
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
