import { GlobalAudioHandle } from '../components/GlobalAudio';

class SoundManager {
  private audioRef: GlobalAudioHandle | null = null;
  private soundEnabled = true;
  private musicVolume = 0.3;
  private effectVolume = 0.8;
  private bulletVolume = 0.5;

  setAudioRef(ref: GlobalAudioHandle | null) {
    this.audioRef = ref;
    if (this.audioRef) {
      this.audioRef.setMusicVolume(this.musicVolume);
    }
  }

  playBackgroundMusic(loop = true) {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playBackground('spaceTheme', loop);
    }
  }

  stopBackgroundMusic() {
    if (this.audioRef) {
      this.audioRef.stopBackground();
    }
  }

  playShootSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('shoot', this.bulletVolume);
    }
  }

  playBombSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('bomb', this.effectVolume);
    }
  }

  playExplosionSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('bomb', this.effectVolume);
    }
  }

  playGameOverSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('gameOver', this.effectVolume);
      this.audioRef.playEffect('explosion', this.effectVolume);
    }
  }

  playPowerUpSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('powerUp', this.effectVolume);
    }
  }

  playLevelUpSound() {
    if (this.soundEnabled && this.audioRef) {
      this.audioRef.playEffect('levelUp', this.effectVolume);
    }
  }

  stopAllEffects() {
    if (this.audioRef) {
      this.audioRef.stopAllEffects();
    }
  }

  stopEffect(key: string) {
    if (this.audioRef) {
      this.audioRef.stopEffect(key);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.audioRef) {
      this.audioRef.setMusicVolume(volume);
    }
  }

  setEffectVolume(volume: number) {
    this.effectVolume = volume;
  }

  setBulletVolume(volume: number) {
    this.bulletVolume = volume;
  }

  getMusicVolume() { return this.musicVolume; }
  getEffectVolume() { return this.effectVolume; }
  getBulletVolume() { return this.bulletVolume; }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

export const soundManager = new SoundManager();
