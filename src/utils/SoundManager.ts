import { Platform } from 'react-native';

interface DummySound {
  play: (callback?: (success: boolean) => void) => void;
  stop: (callback?: () => void) => void;
  setVolume: (volume: number) => void;
  setNumberOfLoops: (loops: number) => void;
  release: () => void;
}

interface SoundLibrary {
  MAIN_BUNDLE: string;
  setCategory: (category: string) => void;
  new (filename: string, bundle: string, callback?: (error: unknown) => void): DummySound;
}

type SoundKey = 'spaceTheme' | 'shoot' | 'explosion' | 'gameOver' | 'powerUp' | 'levelUp';

const noopSound: DummySound = {
  play: callback => callback?.(false),
  stop: callback => callback?.(),
  setVolume: () => {},
  setNumberOfLoops: () => {},
  release: () => {},
};

let Sound: SoundLibrary | null = null;
try {
  Sound = require('react-native-sound').default;
  if (Sound) {
    Sound.setCategory('Playback');
  }
} catch {
  Sound = null;
}

const SOUND_CANDIDATES: Record<SoundKey, string[]> = {
  spaceTheme: Platform.OS === 'android' ? ['space_theme'] : ['space theme.mp3', 'space_theme.mp3'],
  shoot: Platform.OS === 'android' ? ['shoot'] : ['Shooting sound effects.mp3', 'shoot.mp3'],
  explosion: Platform.OS === 'android' ? ['explosion'] : ['Explosion sounds.mp3', 'explosion.mp3'],
  gameOver: Platform.OS === 'android' ? ['game_over'] : ['Game over.mp3', 'game_over.mp3'],
  powerUp: Platform.OS === 'android' ? ['power_up'] : ['Power-up sounds.mp3', 'power_up.mp3'],
  levelUp: Platform.OS === 'android' ? ['levelup', 'levelup.mp3'] : ['levelup.mp3'],
};

const SOUND_VOLUME: Record<SoundKey, number> = {
  spaceTheme: 0.3,
  shoot: 0.45,
  explosion: 0.75,
  gameOver: 0.8,
  powerUp: 0.65,
  levelUp: 0.8,
};

class SoundManager {
  private sounds: Partial<Record<SoundKey, DummySound>> = {};
  private backgroundMusic: DummySound | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    if (!Sound) {
      this.isInitialized = true;
      return;
    }

    (Object.keys(SOUND_CANDIDATES) as SoundKey[]).forEach(key => {
      this.loadSound(key, SOUND_CANDIDATES[key]);
    });

    this.isInitialized = true;
  }

  private loadSound(key: SoundKey, candidates: string[], index = 0) {
    if (!Sound || index >= candidates.length) {
      this.sounds[key] = noopSound;
      return;
    }

    const filename = candidates[index];
    this.sounds[key] = new Sound(filename, Sound.MAIN_BUNDLE, error => {
      if (error) {
        this.loadSound(key, candidates, index + 1);
        return;
      }

      this.sounds[key]?.setVolume(SOUND_VOLUME[key]);
    });
  }

  private playEffect(key: SoundKey) {
    if (!this.isInitialized) return;

    const sound = this.sounds[key];
    if (!sound) return;

    sound.stop(() => {
      sound.play(() => {});
    });
  }

  playBackgroundMusic(loop = true) {
    if (!this.isInitialized) return;

    const sound = this.sounds.spaceTheme;
    if (!sound) return;

    if (this.backgroundMusic && this.backgroundMusic !== sound) {
      this.backgroundMusic.stop();
      this.backgroundMusic.release();
    }

    this.backgroundMusic = sound;
    this.backgroundMusic.setVolume(SOUND_VOLUME.spaceTheme);
    this.backgroundMusic.setNumberOfLoops(loop ? -1 : 0);
    this.backgroundMusic.stop(() => {
      this.backgroundMusic?.play(() => {});
    });
  }

  stopBackgroundMusic() {
    this.backgroundMusic?.stop();
  }

  playShootSound() {
    this.playEffect('shoot');
  }

  playExplosionSound() {
    this.playEffect('explosion');
  }

  playGameOverSound() {
    this.playEffect('gameOver');
  }

  playPowerUpSound() {
    this.playEffect('powerUp');
  }

  playLevelUpSound() {
    this.playEffect('levelUp');
  }

  setVolume(volume: number) {
    this.backgroundMusic?.setVolume(volume);
  }

  releaseAll() {
    (Object.values(this.sounds) as DummySound[]).forEach(sound => {
      sound.release();
    });
    this.backgroundMusic?.release();
  }
}

export const soundManager = new SoundManager();
