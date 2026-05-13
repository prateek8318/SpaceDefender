import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GameOverModal } from '../components/GameOverModal';
import { HUD } from '../components/HUD';
import { Player } from '../components/Player';
import { SkinType } from '../types/game.types';
import { Enemy } from '../components/Enemy';
import { Bullet } from '../components/Bullet';
import { BackgroundStars } from '../components/BackgroundStars';
import { useGameState } from '../hooks/useGameState';
import { Particle } from '../components/Particle';
import { ComboMultiplierPop } from '../components/ComboMultiplierPop';
import { PowerUp } from '../components/PowerUp';
import { PowerUpModel, PowerUpType, PerkType, WeaponType } from '../types/game.types';
import { 
  saveScore, 
  saveUnlockedLevel, 
  getUpgrades, 
  Upgrades, 
  addCoins, 
  getBestScore, 
  getSelectedSkin, 
  getGyroEnabled,
  getSelectedWeapon,
  saveSelectedWeapon,
  getCoins,
  saveStars
} from '../utils/storage';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { PerkSelectionModal } from '../components/PerkSelectionModal';
import { WeaponSelectionModal } from '../components/WeaponSelectionModal';
import { COLORS } from '../utils/colors';
import { hp, screenHeightPx, screenWidthPx, wp } from '../utils/responsive';
import { getLevelConfig } from '../utils/levelConfig';
import { soundManager } from '../utils/SoundManager';
import { adManager } from '../utils/AdManager';
import { useGyroscope } from '../hooks/useGyroscope';
import { firebaseManager } from '../utils/FirebaseManager';

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
  shield?: number;
  maxShield?: number;
  speed: number;
  points: number;
  drift: number;
  phase: number;
  movementType?: 'linear' | 'zigzag' | 'dive' | 'spiral' | 'formation';
  startTime?: number;
  frozen?: number;
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
  isHoming?: boolean;
  targetX?: number;
  targetY?: number;
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

const intersects = (bullet: BulletModel, enemy: EnemyModel, deltaSeconds: number) => {
  // Increase collision height based on speed to prevent skipping at low FPS
  const travelDistance = Math.abs(bullet.vy * deltaSeconds);
  const collisionHeight = Math.max(bullet.height, travelDistance + 10);
  
  return (
    bullet.x < enemy.x + enemy.width &&
    bullet.x + bullet.width > enemy.x &&
    bullet.y < enemy.y + enemy.height &&
    bullet.y + collisionHeight > enemy.y
  );
};

let idCounter = 0;
const makeId = (prefix: string) => {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
};

export const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { levelId } = (route.params as any) || { levelId: 1 };

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
    activateShield,
    activatePowerUp,
    revive,
    nextLevel,
    setPerk,
    setWeapon,
  } = useGameState(levelId);

  const [levelStats, setLevelStats] = useState({ bestCombo: 0, kills: 0 });
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showPerkModal, setShowPerkModal] = useState(false);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [activeUpgrades, setActiveUpgrades] = useState<Upgrades | null>(null);
  const [bombsRemaining, setBombsRemaining] = useState(1);
  const [coins, setCoins] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const levelClearHandledRef = useRef(false);
  
  const perkAutoShieldRef = useRef(0);
  const perkAutoBombRef = useRef(0);

  useEffect(() => {
    if (gameState.combo > levelStats.bestCombo) {
      setLevelStats(prev => ({ ...prev, bestCombo: gameState.combo }));
    }
  }, [gameState.combo]);

  useEffect(() => {
    if (gameState.status === 'cleared' && !levelClearHandledRef.current) {
      levelClearHandledRef.current = true;
      const finalScore = gameState.score;
      const earnedStars = gameState.lives >= 3 ? 3 : gameState.lives >= 2 ? 2 : 1;
      
      const checkPB = async () => {
        const best = await getBestScore();
        if (finalScore > best) setIsPersonalBest(true);
        // Save stars for the level
        await saveStars(gameState.level, earnedStars);
      };
      checkPB();
      
      soundManager.stopBackgroundMusic();
      setShowWinModal(true);
    }
  }, [gameState.status]);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [shieldCooldown, setShieldCooldown] = useState(0);
  const [bombCooldown, setBombCooldown] = useState(0);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [hitKey, setHitKey] = useState(0);

  const PARTICLE_POOL_SIZE = 120;
  const particlePool = useRef(
    Array.from({ length: PARTICLE_POOL_SIZE }).map((_, i) => ({
      id: `p-${i}`,
      x: useSharedValue(-100),
      y: useSharedValue(-100),
      opacity: useSharedValue(0),
      scale: useSharedValue(1),
      active: false,
      color: '#fff',
      size: 4,
    }))
  ).current;

  const [activeParticles, setActiveParticles] = useState<number[]>([]);
  const nextParticleIdx = useRef(0);

  const triggerExplosion = useCallback((x: number, y: number, type: EnemyKind) => {
    const count = type === 'boss' ? 35 : type === 'tank' ? 12 : 8;
    const color = type === 'fast' ? '#f1c40f' : type === 'tank' ? '#e67e22' : type === 'boss' ? '#e74c3c' : '#bdc3c7';
    const duration = type === 'boss' ? 800 : 400;
    const size = type === 'boss' ? 6 : 4;

    for (let i = 0; i < count; i++) {
      const pIdx = nextParticleIdx.current;
      const p = particlePool[pIdx];
      
      p.color = color;
      p.size = size;
      p.x.value = x;
      p.y.value = y;
      p.opacity.value = 1;
      p.scale.value = 1;

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (type === 'boss' ? 120 : 60);
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      p.x.value = withTiming(targetX, { duration });
      p.y.value = withTiming(targetY, { duration });
      p.opacity.value = withTiming(0, { duration });
      p.scale.value = withTiming(0.2, { duration });

      nextParticleIdx.current = (nextParticleIdx.current + 1) % PARTICLE_POOL_SIZE;
    }

    if (type === 'boss') {
      triggerShake(15, 600);
    }
  }, [particlePool]);

  const shakeAnim = useSharedValue(0);

  const triggerShake = useCallback((intensity: number = 10, duration: number = 300) => {
    shakeAnim.value = withSequence(
      withRepeat(
        withTiming(intensity, { duration: duration / 10 }),
        10,
        true
      ),
      withTiming(0, { duration: 50 })
    );
  }, [shakeAnim]);

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const handleBomb = () => {
    if (bombCooldown > 0 || bombsRemaining <= 0) return;

    soundManager.playBombSound();
    triggerShake(25, 500);
    setEnemies([]);
    setBombsRemaining(prev => prev - 1);
    setBombCooldown(300);
  };

  const handleShield = () => {
    if (shieldCooldown > 0) return;
    const extraDuration = activeUpgrades ? activeUpgrades.shieldDuration * 2000 : 0;
    activateShield(5000 + extraDuration);
    setIsShieldActive(true);
    setShieldCooldown(1200);
  };
  const [currentSkin, setCurrentSkin] = useState<SkinType>('scout');
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      const skin = await getSelectedSkin();
      setCurrentSkin(skin as SkinType);
      
      const gyro = await getGyroEnabled();
      setGyroEnabled(gyro);

      const upg = await getUpgrades();
      setActiveUpgrades(upg);
      setBombsRemaining(1 + (upg.bombCount || 0));

      const weapon = await getSelectedWeapon();
      setWeapon(weapon as WeaponType);

      const c = await getCoins();
      setCoins(c);
    };
    loadSettings();
  }, []);

  const [playerX, setPlayerX] = useState(screenWidthPx / 2 - PLAYER_WIDTH / 2);
  const { playerX: gyroX, setPlayerX: setGyroX } = useGyroscope(gyroEnabled && gameStarted && gameState.status === 'playing', playerX, PLAYER_WIDTH);

  const [enemies, setEnemies] = useState<EnemyModel[]>([]);
  const [bullets, setBullets] = useState<BulletModel[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpModel[]>([]);

  useEffect(() => {
    if (gyroEnabled) {
      setPlayerX(gyroX);
    }
  }, [gyroX, gyroEnabled]);

  useEffect(() => {
    reset();
    setGameStarted(false);
  }, [levelId, reset]);

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
  const [activeMultiplierPop, setActiveMultiplierPop] = useState<number | null>(null);
  const lastMultiplierRef = useRef(1);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  const powerUpsRef = useRef<PowerUpModel[]>([]);
  useEffect(() => {
    powerUpsRef.current = powerUps;
  }, [powerUps]);

  useEffect(() => {
    gameStateRef.current = gameState;
    levelRef.current = gameState.level;

    if (gameState.multiplier > lastMultiplierRef.current) {
      setActiveMultiplierPop(gameState.multiplier);
    }
    lastMultiplierRef.current = gameState.multiplier;
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

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > 0.15) return;

    const types: PowerUpType[] = ['rapidFire', 'multiShot', 'timeSlow', 'shieldRecharge'];
    const type = types[Math.floor(Math.random() * types.length)];

    const newPowerUp: PowerUpModel = {
      id: makeId('pwr'),
      type,
      x,
      y,
      width: 32,
      height: 32,
      speed: 180,
    };

    setPowerUps(prev => [...prev, newPowerUp]);
  }, []);

  const createEnemy = useCallback((currentLevel: number, forceType?: EnemyKind, overridePos?: { x: number, y: number }, movement?: any): EnemyModel => {
    const config = getLevelConfig(currentLevel);
    const isBossLevel = config.bossEvery5;
    const bossChance = isBossLevel ? 0.18 : 0;
    const roll = Math.random();
    let type: EnemyKind = forceType || 'basic';

    if (!forceType) {
      if (roll < bossChance) {
        type = 'boss';
      } else if (roll < 0.2 + currentLevel * 0.005) {
        type = 'tank';
      } else if (roll < 0.5) {
        type = 'fast';
      }
    }

    const size = ENEMY_SIZES[type];
    const hpScale = Math.floor((currentLevel - 1) / 3);
    const speedScale = config.enemySpeed;
    const chosenMovement = movement || (type === 'boss' ? 'linear' : config.availableMovements[Math.floor(Math.random() * config.availableMovements.length)]);

    const baseEnemy = {
      id: makeId(`enemy-${type}`),
      type,
      x: overridePos ? overridePos.x : Math.random() * Math.max(1, screenWidthPx - size.width),
      y: overridePos ? overridePos.y : -size.height,
      width: size.width,
      height: size.height,
      movementType: chosenMovement,
      startTime: Date.now(),
      frozen: 0,
    };

    if (type === 'boss') {
      triggerShake(30, 800);
      const bossHp = 25 + currentLevel * 10;
      const bossShield = 20 + currentLevel * 2;
      return {
        ...baseEnemy,
        hp: bossHp,
        maxHp: bossHp,
        shield: bossShield,
        maxShield: bossShield,
        speed: (90 + speedScale * 18) * ENEMY_SPEED_MULTIPLIER,
        points: 150 + currentLevel * 20,
        drift: 0,
        phase: 0,
      };
    }

    if (type === 'tank') {
      const tankHp = 6 + currentLevel * 1.5;
      const tankShield = 4 + currentLevel * 0.5;
      return {
        ...baseEnemy,
        hp: tankHp,
        maxHp: tankHp,
        shield: tankShield,
        maxShield: tankShield,
        speed: (110 + speedScale * 22) * ENEMY_SPEED_MULTIPLIER,
        points: 35 + currentLevel * 2,
        drift: 10,
        phase: Math.random() * Math.PI,
      };
    }

    if (type === 'fast') {
      return {
        ...baseEnemy,
        hp: 1,
        maxHp: 1,
        speed: (220 + speedScale * 45) * ENEMY_SPEED_MULTIPLIER,
        points: 18 + currentLevel,
        drift: 35 + currentLevel,
        phase: Math.random() * Math.PI * 2,
      };
    }

    const basicHp = 1 + Math.floor(currentLevel * 0.4);
    return {
      ...baseEnemy,
      hp: basicHp,
      maxHp: basicHp,
      speed: (160 + speedScale * 32) * ENEMY_SPEED_MULTIPLIER,
      points: 12 + currentLevel,
      drift: 16 + currentLevel * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
  }, [triggerShake]);

  const createBullets = useCallback((currentLevel: number): BulletModel[] => {
    const config = getLevelConfig(currentLevel);
    const weapon = gameStateRef.current.activeWeapon;
    const isMulti = gameStateRef.current.activePowerUp === 'multiShot' || gameStateRef.current.activePerk === 'alwaysMulti' || weapon === 'shotgun';
    const isRapid = gameStateRef.current.activePowerUp === 'rapidFire' || gameStateRef.current.activePerk === 'alwaysRapid' || weapon === 'laser';
    const sizeMult = gameStateRef.current.activePerk === 'largeBullets' ? 1.5 : (weapon === 'sniper' ? 1.8 : 1);
    
    let bulletCount = isMulti ? 3 : (config.tripleShot ? 3 : config.doubleShot ? 2 : 1);
    if (weapon === 'shotgun') bulletCount = 5;

    const spread = bulletCount === 1 ? [0] : bulletCount === 2 ? [-12, 12] : bulletCount === 3 ? [-18, 0, 18] : [-30, -15, 0, 15, 30];
    const originX = playerXRef.current + PLAYER_WIDTH / 2 - 4 * sizeMult;
    const bulletSpeed = (760 + currentLevel * 18) * BULLET_SPEED_MULTIPLIER * (isRapid ? 1.2 : 1) * (weapon === 'sniper' ? 2 : 1);

    return spread.map(offset => ({
      id: makeId('bullet'),
      x: originX,
      y: PLAYER_START_Y,
      width: (weapon === 'laser' ? 4 : 8) * sizeMult,
      height: (weapon === 'laser' ? 12 : 20) * sizeMult,
      speed: bulletSpeed,
      vx: isMulti ? offset * (weapon === 'shotgun' ? 3.5 : 2) : 0,
      vy: -bulletSpeed,
      hostile: false,
      color: weapon === 'laser' ? '#00d2ff' : weapon === 'sniper' ? '#ff9f43' : (isMulti ? '#2ed573' : isRapid ? '#ff4757' : COLORS.primary),
    }));
  }, []);

  const createEnemyBullets = useCallback((enemy: EnemyModel, currentLevel: number): BulletModel[] => {
    const downwardSpeed = 380 + currentLevel * 18;
    const originX = enemy.x + enemy.width / 2 - 3;
    const originY = enemy.y + enemy.height - 6;

    if (enemy.type === 'boss') {
      const hpPercent = (enemy.hp / enemy.maxHp) * 100;
      
      if (hpPercent <= 30) {
        const angles = [0, 45, 90, 135, 180, 225, 270, 315];
        return angles.map(angle => {
          const rad = (angle * Math.PI) / 180;
          return {
            id: makeId('boss-burst'),
            x: originX,
            y: originY,
            width: 10,
            height: 10,
            speed: downwardSpeed * 1.2,
            vx: Math.cos(rad) * downwardSpeed,
            vy: Math.sin(rad) * downwardSpeed,
            hostile: true,
          };
        });
      }

      if (hpPercent <= 60) {
        const spread = [-160, -80, 0, 80, 160].map(vx => ({
          id: makeId('boss-bullet'),
          x: originX,
          y: originY,
          width: 8,
          height: 20,
          speed: downwardSpeed,
          vx,
          vy: downwardSpeed,
          hostile: true,
        }));

        spread.push({
          id: makeId('boss-homing'),
          x: originX,
          y: originY,
          width: 12,
          height: 12,
          speed: downwardSpeed * 0.8,
          vx: 0,
          vy: downwardSpeed * 0.5,
          hostile: true,
          isHoming: true,
          targetX: playerXRef.current,
          targetY: PLAYER_START_Y,
        });
        return spread;
      }

      return [-100, 0, 100].map(vx => ({
        id: makeId('boss-bullet'),
        x: originX,
        y: originY,
        width: 8,
        height: 20,
        speed: downwardSpeed,
        vx,
        vy: downwardSpeed,
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

  const handleStartGame = useCallback(() => {
    setShowPerkModal(true);
  }, []);

  const handlePerkSelect = useCallback((perk: PerkType) => {
    setShowPerkModal(false);
    setPerk(perk);
    setGameStarted(true);
    startGame();
    soundManager.playBackgroundMusic(true);
  }, [setPerk, startGame]);

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
    soundManager.stopEffect('explosion');
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
    soundManager.stopEffect('explosion');
    setPlayerX(screenWidthPx / 2 - PLAYER_WIDTH / 2);
    setGyroX(screenWidthPx / 2 - PLAYER_WIDTH / 2);
    playerXRef.current = screenWidthPx / 2 - PLAYER_WIDTH / 2;
  }, [clearLoop, reset, resetLoopState]);

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
      try {
        const currentState = gameStateRef.current;
        if (currentState.status !== 'playing') {
          animationFrameRef.current = requestAnimationFrame(updateFrame);
          return;
        }

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMsRaw = Math.min(32, timestamp - lastFrameTimeRef.current);
      lastFrameTimeRef.current = timestamp;
      
      if (gameState.activePerk === 'autoShield') {
        perkAutoShieldRef.current += deltaMsRaw;
        if (perkAutoShieldRef.current >= 30000) {
          perkAutoShieldRef.current = 0;
          handleShield();
        }
      }
      if (gameState.activePerk === 'autoBomb') {
        perkAutoBombRef.current += deltaMsRaw;
        if (perkAutoBombRef.current >= 45000) {
          perkAutoBombRef.current = 0;
          handleBomb();
        }
      }

      const isTimeSlow = gameStateRef.current.activePowerUp === 'timeSlow';
      const deltaMs = isTimeSlow ? deltaMsRaw * 0.6 : deltaMsRaw;
      const deltaSeconds = deltaMs / 1000;
      const currentLevel = levelRef.current;
      const levelConfig = getLevelConfig(currentLevel);
      const maxEnemies = levelConfig.bossEvery5 ? 18 : 11;
      const maxBullets = levelConfig.tripleShot ? 34 : levelConfig.doubleShot ? 28 : 24;
      
      const fireRateBonus = activeUpgrades ? activeUpgrades.fireRate * 0.12 : 0;
      const weapon = gameStateRef.current.activeWeapon;
      const isRapidFire = gameStateRef.current.activePowerUp === 'rapidFire' || gameState.activePerk === 'alwaysRapid' || weapon === 'laser';
      const fireDelayBase = weapon === 'laser' ? 60 : weapon === 'sniper' ? 1000 : weapon === 'shotgun' ? 600 : (isRapidFire ? 50 : (levelConfig.bossEvery5 ? 120 : 90));
      const fireDelay = fireDelayBase * (1 - fireRateBonus);
      const enemyFireDelay = levelConfig.bossEvery5 ? 650 : Math.max(900, 1500 - currentLevel * 35);

      spawnAccumulatorRef.current += deltaMs;
      fireAccumulatorRef.current += deltaMs;
      enemyFireAccumulatorRef.current += deltaMs;
      elapsedAccumulatorRef.current += deltaMs;

      let nextEnemies = enemiesRef.current;
      let nextBullets = bulletsRef.current;
      let nextPowerUps = powerUpsRef.current;

      const spawnDelay = Math.max(180, levelConfig.enemyInterval * 0.45);

      if (spawnAccumulatorRef.current >= spawnDelay && nextEnemies.length < maxEnemies) {
        spawnAccumulatorRef.current = 0;
        
        const roll = Math.random();
        const config = getLevelConfig(currentLevel);
        
        if (config.availableMovements.includes('formation') && roll < 0.15 && nextEnemies.length < maxEnemies - 5) {
          const formationEnemies: EnemyModel[] = [];
          const startX = Math.random() * (screenWidthPx - 200) + 100;
          const offsets = [
            { x: 0, y: 0 },
            { x: -40, y: -40 },
            { x: 40, y: -40 },
            { x: -80, y: -80 },
            { x: 80, y: -80 },
          ];
          offsets.forEach(offset => {
            formationEnemies.push(createEnemy(currentLevel, 'basic', { x: startX + offset.x, y: -100 + offset.y }, 'formation'));
          });
          nextEnemies = [...nextEnemies, ...formationEnemies];
        } else {
          const spawnedEnemies = [createEnemy(currentLevel)];
          if (levelConfig.bossEvery5) {
            spawnedEnemies.push(createEnemy(Math.max(1, currentLevel - 1)));
          } else if (currentLevel >= 8 && Math.random() > 0.55) {
            spawnedEnemies.push(createEnemy(currentLevel));
          }
          nextEnemies = [...nextEnemies, ...spawnedEnemies.slice(0, Math.max(0, maxEnemies - nextEnemies.length))];
        }
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
        setShieldCooldown(prev => Math.max(0, prev - 12));
        setBombCooldown(prev => Math.max(0, prev - 12));
      }

      let lifeLostThisFrame = 0;

      nextEnemies = nextEnemies
        .map(enemy => {
          if (enemy.frozen && enemy.frozen > 0) {
            return { ...enemy, frozen: enemy.frozen - deltaMsRaw };
          }
          let nextY = enemy.y + enemy.speed * deltaSeconds;
          let nextX = enemy.x;
          const time = (timestamp - (enemy.startTime || timestamp)) / 1000;

          if (enemy.type === 'boss') {
            const hpPercent = (enemy.hp / enemy.maxHp) * 100;
            if (hpPercent <= 30) {
              const erraticX = Math.sin(time * 8) * 150;
              const erraticY = Math.cos(time * 4) * 50;
              nextX = clamp(screenWidthPx / 2 - enemy.width / 2 + erraticX, 0, screenWidthPx - enemy.width);
              nextY = 100 + erraticY;
            } else if (hpPercent <= 60) {
              nextX = clamp(enemy.x + Math.sin(time * 3) * 150 * deltaSeconds, 0, screenWidthPx - enemy.width);
              nextY = Math.min(enemy.y, 100);
            } else {
              nextY = Math.min(enemy.y + enemy.speed * 0.5 * deltaSeconds, 100);
            }
          } else {
            switch (enemy.movementType) {
              case 'zigzag':
                const zigOffset = Math.sin(time * 4 + enemy.phase) * enemy.drift * 2;
                nextX = clamp(enemy.x + zigOffset * deltaSeconds * 60, 0, screenWidthPx - enemy.width);
                break;
              case 'dive':
                if (enemy.y < screenHeightPx * 0.4) {
                  const dx = playerXRef.current - enemy.x;
                  nextX += dx * deltaSeconds * 2.5;
                } else {
                  nextY += enemy.speed * deltaSeconds * 1.5;
                }
                break;
              case 'spiral':
                const radius = 50 + Math.sin(time * 2) * 30;
                nextX = clamp(enemy.x + Math.cos(time * 5 + enemy.phase) * radius * deltaSeconds, 0, screenWidthPx - enemy.width);
                nextY += enemy.speed * deltaSeconds * 0.7;
                break;
              case 'formation':
                nextY = enemy.y + enemy.speed * deltaSeconds;
                break;
              default:
                const waveOffset = Math.sin((timestamp / 260) + enemy.phase + enemy.y * 0.012) * enemy.drift * deltaSeconds;
                nextX = clamp(enemy.x + waveOffset, 0, screenWidthPx - enemy.width);
            }
          }

          if (nextY > screenHeightPx) {
            lifeLostThisFrame += 1;
            return null;
          }

          return { ...enemy, x: nextX, y: nextY };
        })
        .filter((enemy): enemy is EnemyModel => enemy !== null);

      nextBullets = nextBullets
        .map(bullet => {
          let nextX = bullet.x + bullet.vx * deltaSeconds;
          let nextY = bullet.y + bullet.vy * deltaSeconds;

          if (bullet.isHoming && bullet.hostile) {
            const dx = playerXRef.current - bullet.x;
            const dy = PLAYER_START_Y - bullet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              nextX += (dx / dist) * bullet.speed * 0.4 * deltaSeconds;
              nextY += (dy / dist) * bullet.speed * 0.4 * deltaSeconds;
            }
          }

          return {
            ...bullet,
            x: nextX,
            y: nextY,
          };
        })
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
          if (!destroyed && intersects(bullet, updatedEnemy, deltaSeconds)) {
            const weapon = gameStateRef.current.activeWeapon;
            const damageBonus = (activeUpgrades ? activeUpgrades.damage * 0.5 : 0) + 
                                (gameStateRef.current.activePerk === 'alwaysMulti' ? -0.3 : 0) +
                                (weapon === 'sniper' ? 10 : weapon === 'laser' ? -0.5 : 0);
            const nextHp = updatedEnemy.hp - (1 + damageBonus);
            
            if (gameStateRef.current.activePerk === 'freeze' && Math.random() < 0.1) {
              updatedEnemy.frozen = 2000;
            }

            const oldHpPercent = (updatedEnemy.hp / updatedEnemy.maxHp) * 100;
            const newHpPercent = (nextHp / updatedEnemy.maxHp) * 100;

            if (updatedEnemy.type === 'boss') {
              if ((oldHpPercent > 60 && newHpPercent <= 60) || (oldHpPercent > 30 && newHpPercent <= 30)) {
                triggerShake(20, 500);
                soundManager.playLevelUpSound();
              }
            }

            if (gameStateRef.current.activePerk !== 'pierce' && weapon !== 'sniper') {
              destroyed = nextHp <= 0;
            }

            if (nextHp <= 0) {
              updateScore(updatedEnemy.points);
              addKill();
              
              // Award Coins
              const coinsToAward = Math.floor((updatedEnemy.points / 10) * (gameStateRef.current.activePerk === 'doubleCoins' ? 2 : 1));
              if (coinsToAward > 0) {
                addCoins(coinsToAward);
                setCoins(prev => {
                  const next = prev + coinsToAward;
                  firebaseManager.syncCoins(next);
                  return next;
                });
              }

              soundManager.playExplosionSound();
              triggerExplosion(updatedEnemy.x + updatedEnemy.width / 2, updatedEnemy.y + updatedEnemy.height / 2, updatedEnemy.type);
              spawnPowerUp(updatedEnemy.x + updatedEnemy.width / 2, updatedEnemy.y + updatedEnemy.height / 2);
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
          const armorChance = activeUpgrades ? activeUpgrades.armor * 0.15 : 0;
          if (Math.random() < armorChance) {
            // Armor blocked the hit!
            playerHitCooldownRef.current = PLAYER_HIT_COOLDOWN_MS;
            triggerShake(5, 100);
            return;
          }

          playerHitCooldownRef.current = PLAYER_HIT_COOLDOWN_MS;
          loseLife();
          setHitKey(prev => prev + 1); // Trigger hit flash
          triggerShake(12, 300); // Screen shake on hit
          soundManager.playExplosionSound();
          continue;
        }

        if (!hitsPlayer) {
          safeHostileBullets.push(bullet);
        }
      }

      nextBullets = [...remainingBullets, ...safeHostileBullets];

      // Update and check PowerUps
      nextPowerUps = nextPowerUps
        .map(p => ({ ...p, y: p.y + p.speed * (deltaMsRaw / 1000) })) // PowerUps move in real-time, not affected by timeSlow for player benefit
        .filter(p => {
          const collected = 
            p.x < playerBounds.x + playerBounds.width &&
            p.x + p.width > playerBounds.x &&
            p.y < playerBounds.y + playerBounds.height &&
            p.y + p.height > playerBounds.y;

          if (collected) {
            if (p.type === 'shieldRefill') {
              setShieldCooldown(0);
            } else if (p.type === 'bombRefill') {
              setBombsRemaining(prev => prev + 1);
            }
            activatePowerUp(p.type);
            soundManager.playLevelUpSound(); // Use level-up sound as a placeholder for collection
            return false;
          }

          // Magnet Logic
          if (activeUpgrades && activeUpgrades.magnet > 0) {
            const dx = playerBounds.x + playerBounds.width / 2 - p.x;
            const dy = playerBounds.y + playerBounds.height / 2 - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const magnetRange = 100 + activeUpgrades.magnet * 50;
            if (dist < magnetRange) {
              const pullForce = (activeUpgrades.magnet * 150) * deltaSeconds;
              return {
                ...p,
                x: p.x + (dx / dist) * pullForce,
                y: p.y + (dy / dist) * pullForce,
              };
            }
          }

          return p.y < screenHeightPx;
        });

      if (lifeLostThisFrame > 0) {
        Array.from({ length: lifeLostThisFrame }).forEach(() => loseLife());
        triggerShake(10, 300);
        setHitKey(prev => prev + 1);
      }

      syncEnemies(nextEnemies);
      syncBullets(nextBullets);
      setPowerUps(nextPowerUps);

      animationFrameRef.current = requestAnimationFrame(updateFrame);
      } catch (error) {
        console.error('Game loop error:', error);
        // Continue the loop even if there's an error
        animationFrameRef.current = requestAnimationFrame(updateFrame);
      }
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

      // Show ad every 10 levels
      if (gameState.level % 10 === 0) {
        // adManager.showInterstitial();
      }
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
    
    const finalScore = gameState.score;
    const earnedCoins = Math.floor(finalScore / 100);
    
    saveScore(finalScore, gameState.level);
    firebaseManager.updateHighScore(finalScore, gameState.level);
    
    if (earnedCoins > 0) {
      addCoins(earnedCoins);
    }

    if (gameState.level >= levelId) {
      saveUnlockedLevel(gameState.level + 1);
    }
  }, [clearLoop, gameState.level, gameState.score, gameState.status, levelId]);

  useEffect(() => {
    return () => {
      clearLoop();
      soundManager.stopBackgroundMusic();
    };
  }, [clearLoop]);

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture} onHandlerStateChange={handlePanGesture}>
        <Animated.View style={[styles.gameContainer, animatedShakeStyle]}>
          <BackgroundStars key="gs-bg-stars" />
          <Player 
            key="gs-player"
            x={playerX} 
            y={PLAYER_START_Y} 
            width={PLAYER_WIDTH} 
            height={PLAYER_HEIGHT} 
            shieldActive={gameState.shieldActive} 
            skin={currentSkin}
            hitKey={hitKey}
          />

          {enemies.map((enemy, idx) => (
            <Enemy key={`gs-enemy-${enemy.id || idx}`} {...enemy} />
          ))}
          
          {bullets.map((bullet, idx) => (
            <Bullet key={`gs-bullet-${bullet.id || idx}`} {...bullet} />
          ))}

          {powerUps.map((p, idx) => (
            <PowerUp key={`gs-pwr-${p.id || idx}`} {...p} />
          ))}

          {activeMultiplierPop && (
            <ComboMultiplierPop 
              multiplier={activeMultiplierPop} 
              onFinish={() => setActiveMultiplierPop(null)} 
            />
          )}

          {particlePool.map((p) => (
            <Particle
              key={p.id}
              x={p.x}
              y={p.y}
              opacity={p.opacity}
              scale={p.scale}
              color={p.color}
              size={p.size}
            />
          ))}

          <HUD 
            key="gs-hud" 
            score={gameState.score} 
            lives={gameState.lives} 
            level={gameState.level}
            multiplier={gameState.multiplier}
            combo={gameState.combo}
            activePowerUp={gameState.activePowerUp}
            powerUpTime={gameState.powerUpTime}
            coins={coins}
          />

          {gameStarted && gameState.status === 'playing' && (
            <View key="gs-controls" style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                <View style={styles.pauseIcon} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.bombButton, 
                  (bombCooldown > 0 || bombsRemaining <= 0) && styles.disabledButton
                ]} 
                onPress={handleBomb}
                disabled={bombCooldown > 0 || bombsRemaining <= 0}
              >
                <Text style={styles.bombIcon}>💣</Text>
                <Text style={styles.bombCountText}>{bombsRemaining}</Text>
                {bombCooldown > 0 && (
                  <View style={styles.cooldownOverlay}>
                    <Text style={styles.cooldownText}>{Math.ceil(bombCooldown / 60)}s</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shieldButton, 
                  shieldCooldown > 0 && styles.disabledButton
                ]} 
                onPress={handleShield}
                disabled={shieldCooldown > 0}
              >
                <Text style={styles.shieldIcon}>🛡️</Text>
                {shieldCooldown > 0 && (
                  <View style={styles.cooldownOverlay}>
                    <Text style={styles.cooldownText}>{Math.ceil(shieldCooldown / 60)}s</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
          </Animated.View>
      </PanGestureHandler>

      {!gameStarted && (
        <View style={styles.startOverlay}>
          <View style={styles.startModal}>
            <Text style={styles.startTitle}>MISSION {levelId}</Text>
            <Text style={styles.startSubtitle}>Ready to defend Earth?</Text>
            
            <TouchableOpacity style={styles.weaponChoice} onPress={() => setShowWeaponModal(true)}>
              <Text style={styles.weaponChoiceText}>WEAPON: {(gameState.activeWeapon || 'standard').toUpperCase()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.startButtonText}>START MISSION</Text>
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
        onRevive={() => {
          setShowGameOverModal(false);
          gameOverHandledRef.current = false;
          revive();
          soundManager.playBackgroundMusic();
        }}
      />

      <LevelCompleteModal
        visible={showWinModal}
        score={gameState.score}
        coins={Math.floor(gameState.score * (gameState.activePerk === 'doubleCoins' ? 2 : 1) / 100)}
        stars={gameState.lives >= 3 ? 3 : gameState.lives >= 2 ? 2 : 1}
        bestCombo={levelStats.bestCombo}
        enemiesKilled={getLevelConfig(gameState.level).killsToAdvance}
        isPersonalBest={isPersonalBest}
        onNextLevel={() => {
          setShowWinModal(false);
          levelClearHandledRef.current = false;
          setLevelStats({ bestCombo: 0, kills: 0 });
          nextLevel();
          soundManager.playBackgroundMusic();
        }}
        onHome={handleHome}
      />

      <PerkSelectionModal 
        visible={showPerkModal}
        onSelect={handlePerkSelect}
      />

      <WeaponSelectionModal
        visible={showWeaponModal}
        currentWeapon={gameState.activeWeapon}
        onSelect={(w) => {
          setWeapon(w);
          saveSelectedWeapon(w);
        }}
        onClose={() => setShowWeaponModal(false)}
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
  weaponChoice: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  weaponChoiceText: {
    color: COLORS.accent,
    fontSize: wp(3),
    fontWeight: '900',
    letterSpacing: 1,
  },
  shieldButton: {
    position: 'absolute',
    right: wp(4),
    bottom: hp(22), // Moved up from bottom
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  bombButton: {
    position: 'absolute',
    right: wp(4),
    bottom: hp(32), // Arranged vertically above shield
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(44, 62, 80, 0.6)',
    borderColor: '#7f8c8d',
    shadowOpacity: 0,
  },
  shieldIcon: {
    fontSize: wp(8),
  },
  bombIcon: {
    fontSize: wp(8),
  },
  bombCountText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: wp(3),
    fontWeight: 'bold',
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    textAlign: 'center',
    lineHeight: wp(6),
    borderWidth: 1,
    borderColor: '#fff',
  },
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
});
