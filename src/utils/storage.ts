// === FILE: src/utils/storage.ts ===

import RNFS from 'react-native-fs';

const STORAGE_DIR = RNFS.DocumentDirectoryPath;
const STORAGE_FILE = `${STORAGE_DIR}/game_data.json`;

interface StorageData {
  [key: string]: string;
}

let memoryStorage: StorageData = {};
let storageInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const initStorage = async (): Promise<void> => {
  if (initializationPromise) return initializationPromise;
  
  initializationPromise = (async () => {
    try {
      const exists = await RNFS.exists(STORAGE_FILE);
      if (exists) {
        const data = await RNFS.readFile(STORAGE_FILE, 'utf8');
        memoryStorage = JSON.parse(data);
      }
      storageInitialized = true;
    } catch (error) {
      console.error('Error loading storage:', error);
      storageInitialized = true; // Still mark as initialized to prevent infinite wait
    }
  })();
  
  return initializationPromise;
};

const waitForInit = async () => {
  if (!storageInitialized) {
    await initStorage();
  }
};

const loadStorage = initStorage; // For backward compatibility if needed internally

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
const SOUND_ENABLED_KEY = '@space_defender_sound_enabled';
const SELECTED_SKIN_KEY = '@space_defender_selected_skin';
const MUSIC_VOLUME_KEY = '@space_defender_music_volume';
const EFFECT_VOLUME_KEY = '@space_defender_effect_volume';
const BULLET_VOLUME_KEY = '@space_defender_bullet_volume';
const GYRO_ENABLED_KEY = '@space_defender_gyro_enabled';

const getItem = async (key: string): Promise<string | null> => {
  try {
    await waitForInit();
    return memoryStorage[key] || null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await waitForInit();
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
    return score ? JSON.parse(score) : 0;
  } catch (error) {
    console.error('Error getting best score:', error);
    return 0;
  }
};

export const saveSoundEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await setItem(SOUND_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving sound enabled setting:', error);
  }
};

export const getSoundEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await getItem(SOUND_ENABLED_KEY);
    return enabled !== null ? JSON.parse(enabled) : true; // Default to true
  } catch (error) {
    console.error('Error getting sound enabled setting:', error);
    return true; // Default to true
  }
};

export const saveSelectedSkin = async (skin: string): Promise<void> => {
  try {
    await setItem(SELECTED_SKIN_KEY, skin);
  } catch (error) {
    console.error('Error saving selected skin:', error);
  }
};

export const getSelectedSkin = async (): Promise<string> => {
  try {
    const skin = await getItem(SELECTED_SKIN_KEY);
    return skin || 'scout';
  } catch (error) {
    console.error('Error getting selected skin:', error);
    return 'scout';
  }
};

export const saveVolumeSettings = async (music: number, effect: number, bullet: number): Promise<void> => {
  try {
    await setItem(MUSIC_VOLUME_KEY, JSON.stringify(music));
    await setItem(EFFECT_VOLUME_KEY, JSON.stringify(effect));
    await setItem(BULLET_VOLUME_KEY, JSON.stringify(bullet));
  } catch (error) {
    console.error('Error saving volume settings:', error);
  }
};

export const getVolumeSettings = async (): Promise<{ music: number; effect: number; bullet: number }> => {
  try {
    const music = await getItem(MUSIC_VOLUME_KEY);
    const effect = await getItem(EFFECT_VOLUME_KEY);
    const bullet = await getItem(BULLET_VOLUME_KEY);
    return {
      music: music ? JSON.parse(music) : 0.2,
      effect: effect ? JSON.parse(effect) : 0.5,
      bullet: bullet ? JSON.parse(bullet) : 0.3,
    };
  } catch (error) {
    console.error('Error getting volume settings:', error);
    return { music: 0.2, effect: 0.5, bullet: 0.3 };
  }
};

export const saveGyroEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await setItem(GYRO_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving gyro enabled setting:', error);
  }
};

export const getGyroEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await getItem(GYRO_ENABLED_KEY);
    return enabled !== null ? JSON.parse(enabled) : false;
  } catch (error) {
    console.error('Error getting gyro enabled setting:', error);
    return false;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    memoryStorage = {};
    await RNFS.unlink(STORAGE_FILE);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
