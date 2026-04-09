import Sound from 'react-native-sound';

// Enable sound playback
Sound.setCategory('Playback');

class SoundManager {
  private sounds: { [key: string]: Sound } = {};
  private backgroundMusic: Sound | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    try {
      // Background music
      this.sounds.spaceTheme = new Sound(
        'space_theme.mp3', // Using underscore for better compatibility
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load space theme', error);
            // Try alternative filename
            this.sounds.spaceTheme = new Sound(
              'space theme.mp3',
              Sound.MAIN_BUNDLE,
              (altError) => {
                if (altError) {
                  console.log('Failed to load space theme with both filenames', altError);
                } else {
                  console.log('Space theme loaded successfully (alt filename)');
                }
              }
            );
          } else {
            console.log('Space theme loaded successfully');
          }
        }
      );

      // Sound effects
      this.sounds.shoot = new Sound(
        'shooting_sound_effects.mp3',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load shoot sound', error);
            // Try alternative
            this.sounds.shoot = new Sound(
              'Shooting sound effects.mp3',
              Sound.MAIN_BUNDLE,
              (altError) => {
                if (altError) {
                  console.log('Failed to load shoot sound with both filenames', altError);
                } else {
                  console.log('Shoot sound loaded successfully (alt filename)');
                  this.sounds.shoot?.setVolume(0.5);
                }
              }
            );
          } else {
            console.log('Shoot sound loaded successfully');
            this.sounds.shoot?.setVolume(0.5);
          }
        }
      );

      this.sounds.explosion = new Sound(
        'explosion_sounds.mp3',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load explosion sound', error);
            // Try alternative
            this.sounds.explosion = new Sound(
              'Explosion sounds.mp3',
              Sound.MAIN_BUNDLE,
              (altError) => {
                if (altError) {
                  console.log('Failed to load explosion sound with both filenames', altError);
                } else {
                  console.log('Explosion sound loaded successfully (alt filename)');
                  this.sounds.explosion?.setVolume(0.7);
                }
              }
            );
          } else {
            console.log('Explosion sound loaded successfully');
            this.sounds.explosion?.setVolume(0.7);
          }
        }
      );

      this.sounds.gameOver = new Sound(
        'game_over.mp3',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load game over sound', error);
            // Try alternative
            this.sounds.gameOver = new Sound(
              'Game over.mp3',
              Sound.MAIN_BUNDLE,
              (altError) => {
                if (altError) {
                  console.log('Failed to load game over sound with both filenames', altError);
                } else {
                  console.log('Game over sound loaded successfully (alt filename)');
                  this.sounds.gameOver?.setVolume(0.8);
                }
              }
            );
          } else {
            console.log('Game over sound loaded successfully');
            this.sounds.gameOver?.setVolume(0.8);
          }
        }
      );

      this.sounds.powerUp = new Sound(
        'power_up_sounds.mp3',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load power-up sound', error);
            // Try alternative
            this.sounds.powerUp = new Sound(
              'Power-up sounds.mp3',
              Sound.MAIN_BUNDLE,
              (altError) => {
                if (altError) {
                  console.log('Failed to load power-up sound with both filenames', altError);
                } else {
                  console.log('Power-up sound loaded successfully (alt filename)');
                  this.sounds.powerUp?.setVolume(0.6);
                }
              }
            );
          } else {
            console.log('Power-up sound loaded successfully');
            this.sounds.powerUp?.setVolume(0.6);
          }
        }
      );

      this.sounds.levelUp = new Sound(
        'levelup.mp3',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.log('Failed to load level up sound', error);
          } else {
            console.log('Level up sound loaded successfully');
            this.sounds.levelUp?.setVolume(0.8);
          }
        }
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing sounds:', error);
    }
  }

  playBackgroundMusic(loop: boolean = true) {
    if (!this.isInitialized || !this.sounds.spaceTheme) return;

    try {
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
        this.backgroundMusic.release();
      }

      this.backgroundMusic = this.sounds.spaceTheme;
      this.backgroundMusic.setVolume(0.3);
      
      if (loop) {
        this.backgroundMusic.setNumberOfLoops(-1);
      }
      
      this.backgroundMusic.play((success) => {
        if (!success) {
          console.log('Background music playback failed');
        }
      });
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  playShootSound() {
    if (!this.isInitialized || !this.sounds.shoot) return;
    
    try {
      this.sounds.shoot.stop(() => {
        this.sounds.shoot.play((success) => {
          if (!success) {
            console.log('Shoot sound playback failed');
          }
        });
      });
    } catch (error) {
      console.error('Error playing shoot sound:', error);
    }
  }

  playExplosionSound() {
    if (!this.isInitialized || !this.sounds.explosion) return;
    
    try {
      this.sounds.explosion.stop(() => {
        this.sounds.explosion.play((success) => {
          if (!success) {
            console.log('Explosion sound playback failed');
          }
        });
      });
    } catch (error) {
      console.error('Error playing explosion sound:', error);
    }
  }

  playGameOverSound() {
    if (!this.isInitialized || !this.sounds.gameOver) return;
    
    try {
      this.sounds.gameOver.stop(() => {
        this.sounds.gameOver.play((success) => {
          if (!success) {
            console.log('Game over sound playback failed');
          }
        });
      });
    } catch (error) {
      console.error('Error playing game over sound:', error);
    }
  }

  playPowerUpSound() {
    if (!this.isInitialized || !this.sounds.powerUp) return;
    
    try {
      this.sounds.powerUp.stop(() => {
        this.sounds.powerUp.play((success) => {
          if (!success) {
            console.log('Power-up sound playback failed');
          }
        });
      });
    } catch (error) {
      console.error('Error playing power-up sound:', error);
    }
  }

  playLevelUpSound() {
    if (!this.isInitialized || !this.sounds.levelUp) return;
    
    try {
      this.sounds.levelUp.stop(() => {
        this.sounds.levelUp.play((success) => {
          if (!success) {
            console.log('Level up sound playback failed');
          }
        });
      });
    } catch (error) {
      console.error('Error playing level up sound:', error);
    }
  }

  setVolume(volume: number) {
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolume(volume);
    }
  }

  releaseAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.release();
    });
    if (this.backgroundMusic) {
      this.backgroundMusic.release();
    }
  }
}

export const soundManager = new SoundManager();
