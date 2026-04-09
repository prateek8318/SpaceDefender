// === FILE: src/screens/GameScreen.tsx ===
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, SafeAreaView } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { GameEngine } from 'react-native-game-engine';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp, screenWidthPx, screenHeightPx } from '../utils/responsive';
import { useGameState } from '../hooks/useGameState';
import { useSounds } from '../hooks/useSounds';
import { saveScore, saveUnlockedLevel } from '../utils/storage';
import { PlayerEntity } from '../types/game.types';
import { PlayerSystem } from '../systems/PlayerSystem';
import { BulletSystem } from '../systems/BulletSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { Player } from '../components/Player';
import { Enemy } from '../components/Enemy';
import { Bullet } from '../components/Bullet';
import { Particle } from '../components/Particle';
import { HUD } from '../components/HUD';
import { GameOverModal } from '../components/GameOverModal';
import { BackgroundStars } from '../components/BackgroundStars';
import { soundManager } from '../utils/SoundManager';

interface RouteParams {
  levelId: number;
}

export const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { levelId } = (route.params as RouteParams) || { levelId: 1 };
  
  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    reset,
    updateTime,
    updateScore,
    addKill,
    loseLife,
  } = useGameState(levelId);
  
  const { playShoot, playExplosion, playLevelUp } = useSounds();
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerX, setPlayerX] = useState(screenWidthPx / 2 - 20);
  const [enemies, setEnemies] = useState<any[]>([]);
  const [bullets, setBullets] = useState<any[]>([]);
  const gameEngineRef = useRef<any>(null);
  const updateInterval = useRef<number | null>(null);
  const enemySpawnInterval = useRef<number | null>(null);
  const bulletFireInterval = useRef<number | null>(null);
  const currentPlayerXRef = useRef(screenWidthPx / 2 - 20);

  const systems = [
    (entities: any[], args: any) => {
      const systemArgs = { ...args, screen: { width: screenWidthPx, height: screenHeightPx } };
      return PlayerSystem(entities, systemArgs);
    },
    (entities: any[], args: any) => {
      const systemArgs = { ...args, screen: { width: screenWidthPx, height: screenHeightPx } };
      return BulletSystem(entities, systemArgs, gameState);
    },
    (entities: any[], args: any) => {
      const systemArgs = { ...args, screen: { width: screenWidthPx, height: screenHeightPx } };
      return EnemySystem(entities, systemArgs, gameState);
    },
    (entities: any[], args: any) => {
      const systemArgs = { ...args, screen: { width: screenWidthPx, height: screenHeightPx } };
      return CollisionSystem(entities, systemArgs, gameState);
    },
    ParticleSystem,
  ];

  const initialEntities = [
    {
      id: 'player',
      x: screenWidthPx / 2 - 20,
      y: screenHeightPx - 100,
      width: 40,
      height: 50,
      speed: 5,
      lives: 3,
      renderer: Player,
    },
  ];

  console.log('GameScreen rendered. Initial entities:', initialEntities.length);
  console.log('GameEngine ref:', gameEngineRef.current);
  console.log('Screen dimensions:', screenWidthPx, screenHeightPx);
  console.log('Player position:', initialEntities[0].x, initialEntities[0].y);

  const handleGameEvent = useCallback(async (event: any) => {
    switch (event.type) {
      case 'play-shoot':
        playShoot();
        break;
      case 'play-explosion':
        playExplosion();
        break;
      case 'enemy-killed':
        updateScore(event.points);
        addKill();
        break;
      case 'next-level':
        playLevelUp();
        soundManager.playLevelUpSound();
        if (gameState.level < 10) {
          gameState.level++;
          await saveUnlockedLevel(gameState.level);
        }
        break;
      case 'power-up':
        soundManager.playPowerUpSound();
        break;
    }
  }, [gameState, playShoot, playExplosion, playLevelUp, gameOver]);

  const handlePanGesture = useCallback((event: any) => {
    const newX = Math.max(0, Math.min(screenWidthPx - 40, playerX + event.nativeEvent.translationX));
    setPlayerX(newX);
    currentPlayerXRef.current = newX; // Update ref for real-time tracking
  }, [playerX]);

  const handlePause = useCallback(() => {
    pauseGame();
    setShowPauseModal(true);
    // Stop background music when paused
    soundManager.stopBackgroundMusic();
  }, []);

  const handleResume = useCallback(() => {
    resumeGame();
    setShowPauseModal(false);
    // Resume background music
    soundManager.playBackgroundMusic(true);
  }, []);

  const handleRetry = useCallback(() => {
    reset();
    setShowGameOverModal(false);
    startGame();
  }, []);

  const handleHome = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    startGame();
    
    // Start background music
    soundManager.playBackgroundMusic(true);
    
    updateInterval.current = setInterval(() => {
      updateTime();
    }, 100);

    // Spawn enemies - different rates for boss levels
    const isBossLevel = levelId % 5 === 0;
    const spawnRate = isBossLevel ? 800 : 2500; // Faster spawn in boss levels
    const maxEnemies = isBossLevel ? 20 : 15; // More enemies in boss levels
    
    enemySpawnInterval.current = setInterval(() => {
      setEnemies(prev => {
        if (prev.length >= maxEnemies) return prev;
        
        // Create tougher enemies in boss levels
        const enemyTypes = isBossLevel ? ['tank', 'fast', 'basic'] : ['basic', 'fast'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let hp = 1;
        if (randomType === 'tank') hp = isBossLevel ? 3 : 2;
        if (randomType === 'fast') hp = 1;
        if (randomType === 'basic') hp = 1;
        
        // Add boss enemy every 10 spawns in boss levels
        if (isBossLevel && Math.random() < 0.1) {
          return [...prev, {
            id: Date.now(),
            type: 'boss',
            x: Math.random() * (screenWidthPx - 60),
            y: -60,
            width: 60,
            height: 60,
            hp: 5,
          }];
        }
        
        return [...prev, {
          id: Date.now(),
          type: randomType,
          x: Math.random() * (screenWidthPx - 30),
          y: -30,
          width: randomType === 'tank' ? 45 : 30,
          height: randomType === 'tank' ? 45 : 30,
          hp: hp,
        }];
      });
    }, spawnRate);

    // Fire bullets - different rates for boss levels
    const bulletCount = isBossLevel ? 2 : 1; // 2 bullets in boss levels
    const fireRate = isBossLevel ? 400 : 200; // Slower fire rate in boss levels
    
    bulletFireInterval.current = setInterval(() => {
      setBullets(prev => {
        const maxBullets = isBossLevel ? 8 : 12; // Fewer bullets in boss levels
        if (prev.length >= maxBullets) return prev;
        
        const currentX = currentPlayerXRef.current + 18;
        
        // Play shoot sound
        soundManager.playShootSound();
        
        const newBullets = [];
        for (let i = 0; i < bulletCount; i++) {
          const offsetX = (i - (bulletCount - 1) / 2) * 15; // Spread bullets
          newBullets.push({
            id: Date.now() + i,
            x: currentX + offsetX,
            y: screenHeightPx - 100,
            width: 4,
            height: 12,
          });
        }
        
        return [...prev, ...newBullets];
      });
    }, fireRate);
  }, [startGame, updateTime, playerX]);

  useEffect(() => {
    if (gameStarted) {
      return () => {
        if (updateInterval.current) clearInterval(updateInterval.current);
        if (enemySpawnInterval.current) clearInterval(enemySpawnInterval.current);
        if (bulletFireInterval.current) clearInterval(bulletFireInterval.current);
        // Stop music when component unmounts
        soundManager.stopBackgroundMusic();
      };
    }
  }, [gameStarted]);

  // Optimized movement logic with better performance
  useEffect(() => {
    if (!gameStarted) return;

    let lastUpdateTime = Date.now();
    const targetFPS = 60; // Increased to 60 for fast smooth gameplay
    const frameInterval = 1000 / targetFPS;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;
      
      if (deltaTime >= frameInterval) {
        // Update enemies
        setEnemies(prev => {
          if (!prev || !Array.isArray(prev)) return [];
          return prev
            .map(enemy => {
              const newY = (enemy.y || 0) + 6; // Much faster enemy movement
              
              // Check if enemy reached bottom
              if (newY > screenHeightPx - 50) {
                loseLife();
                return null;
              }
              
              return { ...enemy, y: newY };
            })
            .filter(enemy => enemy !== null && enemy.y < screenHeightPx + 50);
        });

        // Update bullets
        setBullets(prev => {
          if (!prev || !Array.isArray(prev)) return [];
          return prev
            .map(bullet => ({ ...bullet, y: (bullet.y || 0) - 20 })) // Much faster bullets
            .filter(bullet => bullet.y > -20);
        });

        lastUpdateTime = now;
      }
      
      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);

    // Separate collision detection with lower frequency
    const collisionInterval = setInterval(() => {
      setBullets(prevBullets => {
        if (!prevBullets || !Array.isArray(prevBullets)) return [];
        
        const hitBullets = new Set<number>();
        
        setEnemies(prevEnemies => {
          if (!prevEnemies || !Array.isArray(prevEnemies)) return [];
          
          return prevEnemies.filter(enemy => {
            let hit = false;
            
            for (const bullet of prevBullets) {
              if (hitBullets.has(bullet.id)) continue;
              
              // Get enemy dimensions based on type
              const enemyWidth = enemy.type === 'boss' ? 60 : (enemy.type === 'tank' ? 45 : 30);
              const enemyHeight = enemy.type === 'boss' ? 60 : (enemy.type === 'tank' ? 45 : 30);
              
              // Simple AABB collision detection
              if (bullet.x < enemy.x + enemyWidth &&
                  bullet.x + 4 > enemy.x &&
                  bullet.y < enemy.y + enemyHeight &&
                  bullet.y + 12 > enemy.y) {
                
                hit = true;
                hitBullets.add(bullet.id);
                
                // Reduce enemy HP
                if (enemy.hp > 1) {
                  enemy.hp--;
                  console.log(`Enemy hit! HP remaining: ${enemy.hp}`);
                } else {
                  // Enemy destroyed
                  updateScore(10);
                  addKill();
                  soundManager.playExplosionSound();
                }
                break; // One bullet hit per enemy
              }
            }
            
            return !hit;
          });
        });
        
        return prevBullets.filter(bullet => !hitBullets.has(bullet.id));
      });
    }, 50); // Collision detection at 20Hz

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(collisionInterval);
    };
  }, [gameStarted, screenHeightPx, loseLife, updateScore, addKill]);

  
  useEffect(() => {
    console.log('GameEngine effect - gameState.status:', gameState.status);
    if (gameEngineRef.current && gameState.status === 'playing') {
      console.log('Starting GameEngine');
      gameEngineRef.current.start();
    } else if (gameEngineRef.current && gameState.status === 'paused') {
      console.log('Stopping GameEngine');
      gameEngineRef.current.stop();
    }
  }, [gameState.status]);

  // Game over handling
  useEffect(() => {
    if (gameState.status === 'over') {
      console.log('Game over triggered! Score:', gameState.score, 'Level:', gameState.level);
      
      // Stop background music and play game over sound
      soundManager.stopBackgroundMusic();
      soundManager.playGameOverSound();
      
      gameOver();
      setShowGameOverModal(true);
      
      // Save score with debug
      console.log('Saving score to storage...');
      saveScore(gameState.score, gameState.level).then(() => {
        console.log('Score saved successfully!');
      }).catch(err => {
        console.error('Error saving score:', err);
      });
      
      if (gameState.level > 1) {
        console.log('Saving unlocked level:', gameState.level);
        saveUnlockedLevel(gameState.level).then(() => {
          console.log('Level saved successfully!');
        }).catch(err => {
          console.error('Error saving level:', err);
        });
      }
    }
  }, [gameState.status, gameOver, gameState.score, gameState.level]);

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <View style={styles.gameContainer}>
          {/* Background Stars */}
          <BackgroundStars />
          
          {/* Player Ship */}
          <View style={[styles.playerContainer, { left: playerX, top: screenHeightPx - 100 }]}>
            <View style={styles.engineGlow} />
            <View style={styles.mainBody} />
            <View style={styles.cockpit} />
          </View>

          {/* Enemies */}
          {enemies && enemies.map(enemy => (
            <View key={enemy.id} style={[styles.enemyContainer, { left: enemy.x || 0, top: enemy.y || 0 }]}>
              <View style={styles.enemyBody} />
            </View>
          ))}

          {/* Bullets */}
          {bullets && bullets.map(bullet => (
            <View key={bullet.id} style={[styles.bulletContainer, { left: bullet.x || 0, top: bullet.y || 0 }]}>
              <View style={styles.bulletBody} />
            </View>
          ))}
          
          <HUD
            score={gameState.score}
            lives={gameState.lives}
            level={gameState.level}
          />
          
          {gameStarted && (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <View style={styles.pauseIcon} />
            </TouchableOpacity>
          )}
        </View>
      </PanGestureHandler>

      {!gameStarted && (
        <View style={styles.startOverlay}>
          <View style={styles.startModal}>
            <Text style={styles.startTitle}>LEVEL {levelId}</Text>
            <Text style={styles.startSubtitle}>Ready to defend Earth?</Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.startButtonText}>START GAME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showPauseModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseModal}>
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
              <Text style={styles.resumeButtonText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitButton} onPress={handleHome}>
              <Text style={styles.quitButtonText}>QUIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <GameOverModal
        visible={showGameOverModal}
        score={gameState.score}
        level={gameState.level}
        onRetry={handleRetry}
        onHome={handleHome}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  gameContainer: {
    flex: 1,
  },
  gameEngine: {
    flex: 1,
  },
  pauseButton: {
    position: 'absolute',
    top: hp(10), // Moved down to avoid HUD overlap
    right: wp(4),
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 136, 187, 0.3)',
    borderRadius: wp(5),
    zIndex: 1000,
  },
  pauseIcon: {
    width: wp(4),
    height: wp(4),
    backgroundColor: COLORS.text,
    borderRadius: wp(0.5),
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModal: {
    backgroundColor: COLORS.bg,
    padding: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  resumeButtonText: {
    color: COLORS.bg,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  quitButton: {
    backgroundColor: COLORS.muted,
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: wp(2),
  },
  quitButtonText: {
    color: COLORS.text,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startModal: {
    backgroundColor: COLORS.bg,
    padding: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  startTitle: {
    color: COLORS.primary,
    fontSize: wp(8),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  startSubtitle: {
    color: COLORS.text,
    fontSize: wp(4.5),
    marginBottom: hp(4),
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(8),
    paddingVertical: hp(2.5),
    borderRadius: wp(2),
  },
  startButtonText: {
    color: COLORS.bg,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  testPlayer: {
    position: 'absolute',
    width: 40,
    height: 50,
  },
  testPlayerBody: {
    position: 'absolute',
    width: 30,
    height: 35,
    backgroundColor: 'red',
    left: 5,
    top: 10,
    borderRadius: 15,
  },
  // Player styles for direct rendering
  playerContainer: {
    position: 'absolute',
    width: 40,
    height: 50,
  },
  engineGlow: {
    position: 'absolute',
    width: 20,
    height: 8,
    backgroundColor: COLORS.accent,
    left: 10,
    bottom: 5,
    borderRadius: 4,
    opacity: 0.8,
  },
  mainBody: {
    position: 'absolute',
    width: 30,
    height: 35,
    backgroundColor: COLORS.primary,
    left: 5,
    top: 10,
    borderRadius: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  cockpit: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    left: 16,
    top: 20,
    borderRadius: 4,
  },
  // Enemy styles
  enemyContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  enemyBody: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  // Bullet styles
  bulletContainer: {
    position: 'absolute',
    width: 4,
    height: 12,
  },
  bulletBody: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
