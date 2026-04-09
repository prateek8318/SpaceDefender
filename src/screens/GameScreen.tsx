import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GameOverModal } from '../components/GameOverModal';
import { HUD } from '../components/HUD';
import { Player } from '../components/Player';
import { Enemy } from '../components/Enemy';
import { Bullet } from '../components/Bullet';
import { BackgroundStars } from '../components/BackgroundStars';
import { useGameState } from '../hooks/useGameState';
import { saveScore, saveUnlockedLevel } from '../utils/storage';
import { COLORS } from '../utils/colors';
import { hp, screenHeightPx, screenWidthPx, wp } from '../utils/responsive';
import { getLevelConfig } from '../utils/levelConfig';
import { soundManager } from '../utils/SoundManager';

interface RouteParams {
  levelId: number;
}

type EnemyKind = 'basic' | 'fast' | 'tank' | 'boss';

interface EnemyModel {
  id: string;
  type: EnemyKind;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  points: number;
  drift: number;
  phase: number;
}

interface BulletModel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  vx: number;
  vy: number;
  hostile: boolean;
}

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 70;
const PLAYER_START_Y = screenHeightPx - 120;
const ENEMY_SPEED_MULTIPLIER = 2.45;
const BULLET_SPEED_MULTIPLIER = 1.9;
const PLAYER_HIT_COOLDOWN_MS = 650;

const ENEMY_SIZES: Record<EnemyKind, { width: number; height: number }> = {
  basic: { width: 35, height: 35 },
  fast: { width: 28, height: 40 },
  tank: { width: 45, height: 45 },
  boss: { width: 70, height: 70 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const intersects = (a: BulletModel, b: EnemyModel) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { levelId } = (route.params as RouteParams) || { levelId: 1 };

  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    reset,
    updateTime,
    updateScore,
    addKill,
    loseLife,
  } = useGameState(levelId);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerX, setPlayerX] = useState(screenWidthPx / 2 - PLAYER_WIDTH / 2);
  const [enemies, setEnemies] = useState<EnemyModel[]>([]);
  const [bullets, setBullets] = useState<BulletModel[]>([]);

  const playerXRef = useRef(playerX);
  const gestureStartXRef = useRef(playerX);
  const enemiesRef = useRef<EnemyModel[]>([]);
  const bulletsRef = useRef<BulletModel[]>([]);
  const gameStateRef = useRef(gameState);
  const levelRef = useRef(gameState.level);
  const previousLevelRef = useRef(gameState.level);
  const animationFrameRef = useRef<number | null>(null);
  const spawnAccumulatorRef = useRef(0);
  const fireAccumulatorRef = useRef(0);
  const elapsedAccumulatorRef = useRef(0);
  const enemyFireAccumulatorRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const gameOverHandledRef = useRef(false);
  const playerHitCooldownRef = useRef(0);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    gameStateRef.current = gameState;
    levelRef.current = gameState.level;
  }, [gameState]);

  const syncEnemies = useCallback((nextEnemies: EnemyModel[]) => {
    enemiesRef.current = nextEnemies;
    setEnemies(nextEnemies);
  }, []);

  const syncBullets = useCallback((nextBullets: BulletModel[]) => {
    bulletsRef.current = nextBullets;
    setBullets(nextBullets);
  }, []);

  const clearLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const resetLoopState = useCallback(() => {
    spawnAccumulatorRef.current = 0;
    fireAccumulatorRef.current = 0;
    enemyFireAccumulatorRef.current = 0;
    elapsedAccumulatorRef.current = 0;
    lastFrameTimeRef.current = 0;
    playerHitCooldownRef.current = 0;
  }, []);

  const createEnemy = useCallback((currentLevel: number): EnemyModel => {
    const config = getLevelConfig(currentLevel);
    const isBossLevel = config.bossEvery5;
    const bossChance = isBossLevel ? 0.18 : 0;
    const roll = Math.random();
    let type: EnemyKind = 'basic';

    if (roll < bossChance) {
      type = 'boss';
    } else if (roll < 0.2 + currentLevel * 0.005) {
      type = 'tank';
    } else if (roll < 0.5) {
      type = 'fast';
    }

    const size = ENEMY_SIZES[type];
    const hpScale = Math.floor((currentLevel - 1) / 3);
    const speedScale = config.enemySpeed;

    if (type === 'boss') {
      return {
        id: makeId('enemy-boss'),
        type,
        x: Math.random() * Math.max(1, screenWidthPx - size.width),
        y: -size.height,
        width: size.width,
        height: size.height,
        hp: 6 + Math.floor(currentLevel / 2),
        maxHp: 6 + Math.floor(currentLevel / 2),
        speed: (110 + speedScale * 24) * ENEMY_SPEED_MULTIPLIER,
        points: 60 + currentLevel * 5,
        drift: 42 + currentLevel * 1.5,
        phase: Math.random() * Math.PI * 2,
      };
    }

    if (type === 'tank') {
      return {
        id: makeId('enemy-tank'),
        type,
        x: Math.random() * Math.max(1, screenWidthPx - size.width),
        y: -size.height,
        width: size.width,
        height: size.height,
        hp: 2 + hpScale,
        maxHp: 2 + hpScale,
        speed: (135 + speedScale * 30) * ENEMY_SPEED_MULTIPLIER,
        points: 20 + currentLevel * 2,
        drift: 18 + currentLevel * 0.7,
        phase: Math.random() * Math.PI * 2,
      };
    }

    if (type === 'fast') {
      return {
        id: makeId('enemy-fast'),
        type,
        x: Math.random() * Math.max(1, screenWidthPx - size.width),
        y: -size.height,
        width: size.width,
        height: size.height,
        hp: 1,
        maxHp: 1,
        speed: (185 + speedScale * 38) * ENEMY_SPEED_MULTIPLIER,
        points: 14 + currentLevel,
        drift: 30 + currentLevel,
        phase: Math.random() * Math.PI * 2,
      };
    }

    return {
      id: makeId('enemy-basic'),
      type,
      x: Math.random() * Math.max(1, screenWidthPx - size.width),
      y: -size.height,
      width: size.width,
      height: size.height,
      hp: 1 + Math.floor(hpScale / 2),
      maxHp: 1 + Math.floor(hpScale / 2),
      speed: (145 + speedScale * 28) * ENEMY_SPEED_MULTIPLIER,
      points: 10 + currentLevel,
      drift: 14 + currentLevel * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
  }, []);

  const createBullets = useCallback((currentLevel: number): BulletModel[] => {
    const config = getLevelConfig(currentLevel);
    const bulletCount = config.tripleShot ? 3 : config.doubleShot ? 2 : 1;
    const spread = bulletCount === 1 ? [0] : bulletCount === 2 ? [-12, 12] : [-18, 0, 18];
    const originX = playerXRef.current + PLAYER_WIDTH / 2 - 2;
    const bulletSpeed = (760 + currentLevel * 18) * BULLET_SPEED_MULTIPLIER;

    return spread.map(offset => ({
      id: makeId('bullet'),
      x: originX + offset,
      y: PLAYER_START_Y,
      width: 6,
      height: 18,
      speed: bulletSpeed,
      vx: 0,
      vy: -bulletSpeed,
      hostile: false,
    }));
  }, []);

  const createEnemyBullets = useCallback((enemy: EnemyModel, currentLevel: number): BulletModel[] => {
    const downwardSpeed = 380 + currentLevel * 18;
    const originX = enemy.x + enemy.width / 2 - 3;
    const originY = enemy.y + enemy.height - 6;

    if (enemy.type === 'boss') {
      return [-150, -60, 0, 60, 150].map(vx => ({
        id: makeId('enemy-bullet'),
        x: originX,
        y: originY,
        width: 8,
        height: 20,
        speed: downwardSpeed,
        vx,
        vy: downwardSpeed + Math.abs(vx) * 0.2,
        hostile: true,
      }));
    }

    return [
      {
        id: makeId('enemy-bullet'),
        x: originX,
        y: originY,
        width: 7,
        height: 18,
        speed: downwardSpeed,
        vx: enemy.type === 'fast' ? Math.sin(enemy.phase) * 45 : 0,
        vy: downwardSpeed,
        hostile: true,
      },
    ];
  }, []);

  const handlePause = useCallback(() => {
    pauseGame();
    setShowPauseModal(true);
    soundManager.stopBackgroundMusic();
  }, [pauseGame]);

  const handleResume = useCallback(() => {
    resumeGame();
    setShowPauseModal(false);
    soundManager.playBackgroundMusic(true);
  }, [resumeGame]);

  const handleHome = useCallback(() => {
    clearLoop();
    soundManager.stopBackgroundMusic();
    navigation.goBack();
  }, [clearLoop, navigation]);

  const handleRetry = useCallback(() => {
    clearLoop();
    reset();
    setShowGameOverModal(false);
    setGameStarted(false);
    setEnemies([]);
    setBullets([]);
    enemiesRef.current = [];
    bulletsRef.current = [];
    resetLoopState();
    gameOverHandledRef.current = false;
    setPlayerX(screenWidthPx / 2 - PLAYER_WIDTH / 2);
    playerXRef.current = screenWidthPx / 2 - PLAYER_WIDTH / 2;
  }, [clearLoop, reset, resetLoopState]);

  const handleStartGame = useCallback(() => {
    gameOverHandledRef.current = false;
    setShowGameOverModal(false);
    setShowPauseModal(false);
    setGameStarted(true);
    setEnemies([]);
    setBullets([]);
    enemiesRef.current = [];
    bulletsRef.current = [];
    resetLoopState();
    startGame();
    soundManager.playBackgroundMusic(true);
  }, [resetLoopState, startGame]);

  const handlePanGesture = useCallback((event: any) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.ACTIVE) {
      const nextX = clamp(
        gestureStartXRef.current + translationX,
        0,
        screenWidthPx - PLAYER_WIDTH,
      );
      playerXRef.current = nextX;
      setPlayerX(nextX);
      return;
    }

    if (state === State.END || state === State.CANCELLED || state === State.BEGAN) {
      gestureStartXRef.current = playerXRef.current;
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || gameState.status !== 'playing') {
      clearLoop();
      return;
    }

    const updateFrame = (timestamp: number) => {
      const currentState = gameStateRef.current;
      if (currentState.status !== 'playing') {
        animationFrameRef.current = requestAnimationFrame(updateFrame);
        return;
      }

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(32, timestamp - lastFrameTimeRef.current);
      lastFrameTimeRef.current = timestamp;
      const deltaSeconds = deltaMs / 1000;
      const currentLevel = levelRef.current;
      const levelConfig = getLevelConfig(currentLevel);
      const maxEnemies = levelConfig.bossEvery5 ? 18 : 11;
      const maxBullets = levelConfig.tripleShot ? 34 : levelConfig.doubleShot ? 28 : 24;
      const fireDelay = levelConfig.bossEvery5 ? 120 : 90;
      const enemyFireDelay = levelConfig.bossEvery5 ? 650 : Math.max(900, 1500 - currentLevel * 35);

      spawnAccumulatorRef.current += deltaMs;
      fireAccumulatorRef.current += deltaMs;
      enemyFireAccumulatorRef.current += deltaMs;
      elapsedAccumulatorRef.current += deltaMs;

      let nextEnemies = enemiesRef.current;
      let nextBullets = bulletsRef.current;

      const spawnDelay = Math.max(180, levelConfig.enemyInterval * 0.45);

      if (spawnAccumulatorRef.current >= spawnDelay && nextEnemies.length < maxEnemies) {
        spawnAccumulatorRef.current = 0;
        const spawnedEnemies = [createEnemy(currentLevel)];
        if (levelConfig.bossEvery5) {
          spawnedEnemies.push(createEnemy(Math.max(1, currentLevel - 1)));
        } else if (currentLevel >= 8 && Math.random() > 0.55) {
          spawnedEnemies.push(createEnemy(currentLevel));
        }
        nextEnemies = [...nextEnemies, ...spawnedEnemies.slice(0, Math.max(0, maxEnemies - nextEnemies.length))];
      }

      if (fireAccumulatorRef.current >= fireDelay && nextBullets.length < maxBullets) {
        fireAccumulatorRef.current = 0;
        nextBullets = [...nextBullets, ...createBullets(currentLevel)];
        soundManager.playShootSound();
      }

      if (enemyFireAccumulatorRef.current >= enemyFireDelay) {
        enemyFireAccumulatorRef.current = 0;
        const shooters = nextEnemies.filter(enemy =>
          enemy.type === 'boss' ||
          (currentLevel >= 4 && enemy.type === 'tank') ||
          (currentLevel >= 9 && enemy.type === 'fast' && Math.random() > 0.45),
        );

        if (shooters.length > 0) {
          const pickedShooters = shooters
            .sort((a, b) => b.y - a.y)
            .slice(0, levelConfig.bossEvery5 ? 2 : 1);

          const hostileBullets = pickedShooters.flatMap(enemy => createEnemyBullets(enemy, currentLevel));
          nextBullets = [...nextBullets, ...hostileBullets].slice(-maxBullets);
        }
      }

      if (elapsedAccumulatorRef.current >= 200) {
        elapsedAccumulatorRef.current = 0;
        updateTime();
      }

      let lifeLostThisFrame = 0;

      nextEnemies = nextEnemies
        .map(enemy => {
          const nextY = enemy.y + enemy.speed * deltaSeconds;
          const waveOffset = Math.sin((timestamp / 260) + enemy.phase + enemy.y * 0.012) * enemy.drift * deltaSeconds;
          const nextX = clamp(enemy.x + waveOffset, 0, screenWidthPx - enemy.width);
          if (nextY > screenHeightPx) {
            lifeLostThisFrame += 1;
            return null;
          }

          return {
            ...enemy,
            x: nextX,
            y: nextY,
          };
        })
        .filter((enemy): enemy is EnemyModel => enemy !== null);

      nextBullets = nextBullets
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.vx * deltaSeconds,
          y: bullet.y + bullet.vy * deltaSeconds,
        }))
        .filter(
          bullet =>
            bullet.y + bullet.height > -30 &&
            bullet.y < screenHeightPx + 40 &&
            bullet.x + bullet.width > -20 &&
            bullet.x < screenWidthPx + 20,
        );

      const playerBullets = nextBullets.filter(bullet => !bullet.hostile);
      let hostileBullets = nextBullets.filter(bullet => bullet.hostile);
      const survivingEnemies: EnemyModel[] = [];
      let remainingBullets = playerBullets;

      for (const enemy of nextEnemies) {
        let updatedEnemy = enemy;
        let destroyed = false;
        const nextRemainingBullets: BulletModel[] = [];

        for (const bullet of remainingBullets) {
          if (!destroyed && intersects(bullet, updatedEnemy)) {
            const nextHp = updatedEnemy.hp - 1;
            if (nextHp <= 0) {
              updateScore(updatedEnemy.points);
              addKill();
              soundManager.playExplosionSound();
              destroyed = true;
            } else {
              updatedEnemy = {
                ...updatedEnemy,
                hp: nextHp,
              };
            }
            continue;
          }

          nextRemainingBullets.push(bullet);
        }

        if (!destroyed) {
          survivingEnemies.push(updatedEnemy);
        }

        remainingBullets = nextRemainingBullets;
      }

      nextEnemies = survivingEnemies;

      if (playerHitCooldownRef.current > 0) {
        playerHitCooldownRef.current = Math.max(0, playerHitCooldownRef.current - deltaMs);
      }

      const safeHostileBullets: BulletModel[] = [];
      const playerBounds = {
        x: playerXRef.current + 8,
        y: PLAYER_START_Y + 8,
        width: PLAYER_WIDTH - 16,
        height: PLAYER_HEIGHT - 18,
      };

      for (const bullet of hostileBullets) {
        const hitsPlayer =
          bullet.x < playerBounds.x + playerBounds.width &&
          bullet.x + bullet.width > playerBounds.x &&
          bullet.y < playerBounds.y + playerBounds.height &&
          bullet.y + bullet.height > playerBounds.y;

        if (hitsPlayer && playerHitCooldownRef.current === 0) {
          playerHitCooldownRef.current = PLAYER_HIT_COOLDOWN_MS;
          loseLife();
          soundManager.playExplosionSound();
          continue;
        }

        if (!hitsPlayer) {
          safeHostileBullets.push(bullet);
        }
      }

      nextBullets = [...remainingBullets, ...safeHostileBullets];

      if (lifeLostThisFrame > 0) {
        Array.from({ length: lifeLostThisFrame }).forEach(() => loseLife());
      }

      syncEnemies(nextEnemies);
      syncBullets(nextBullets);

      animationFrameRef.current = requestAnimationFrame(updateFrame);
    };

    animationFrameRef.current = requestAnimationFrame(updateFrame);

    return clearLoop;
  }, [
    addKill,
    clearLoop,
    createBullets,
    createEnemy,
    createEnemyBullets,
    gameStarted,
    gameState.status,
    loseLife,
    syncBullets,
    syncEnemies,
    updateScore,
    updateTime,
  ]);

  useEffect(() => {
    if (gameState.level > previousLevelRef.current) {
      previousLevelRef.current = gameState.level;
      soundManager.playLevelUpSound();
      saveUnlockedLevel(gameState.level);
      return;
    }

    previousLevelRef.current = gameState.level;
  }, [gameState.level]);

  useEffect(() => {
    if (gameState.status !== 'over' || gameOverHandledRef.current) {
      return;
    }

    gameOverHandledRef.current = true;
    clearLoop();
    soundManager.stopBackgroundMusic();
    soundManager.playGameOverSound();
    setShowGameOverModal(true);
    saveScore(gameState.score, gameState.level);
    if (gameState.level > 1) {
      saveUnlockedLevel(gameState.level);
    }
  }, [clearLoop, gameState.level, gameState.score, gameState.status]);

  useEffect(() => {
    return () => {
      clearLoop();
      soundManager.stopBackgroundMusic();
    };
  }, [clearLoop]);

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture} onHandlerStateChange={handlePanGesture}>
        <View style={styles.gameContainer}>
          <BackgroundStars />
          <Player x={playerX} y={PLAYER_START_Y} width={PLAYER_WIDTH} height={PLAYER_HEIGHT} />

          {enemies.map(enemy => (
            <Enemy key={enemy.id} {...enemy} />
          ))}

          {bullets.map(bullet => (
            <Bullet key={bullet.id} {...bullet} />
          ))}

          <HUD score={gameState.score} lives={gameState.lives} level={gameState.level} />

          {gameStarted && gameState.status === 'playing' && (
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

      <Modal visible={showPauseModal} transparent animationType="fade" statusBarTranslucent>
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
    position: 'relative',
  },
  pauseButton: {
    position: 'absolute',
    top: hp(10),
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
});
