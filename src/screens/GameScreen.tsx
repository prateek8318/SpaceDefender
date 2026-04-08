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
  } = useGameState(levelId);
  
  const { playShoot, playExplosion, playLevelUp } = useSounds();
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const gameEngineRef = useRef<any>(null);
  const updateInterval = useRef<number | null>(null);

  const systems = [
    PlayerSystem,
    (entities: any[], args: any) => BulletSystem(entities, args, gameState),
    (entities: any[], args: any) => EnemySystem(entities, args, gameState),
    (entities: any[], args: any) => CollisionSystem(entities, args, gameState),
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

  const handleGameEvent = useCallback(async (event: any) => {
    switch (event.type) {
      case 'play-shoot':
        playShoot();
        break;
      case 'play-explosion':
        playExplosion();
        break;
      case 'life-lost':
        gameState.lives = Math.max(0, gameState.lives - 1);
        if (gameState.lives === 0) {
          gameOver();
          setShowGameOverModal(true);
          await saveScore(gameState.score, gameState.level);
          if (gameState.level > 1) {
            await saveUnlockedLevel(gameState.level);
          }
        }
        break;
      case 'next-level':
        playLevelUp();
        if (gameState.level < 10) {
          gameState.level++;
          await saveUnlockedLevel(gameState.level);
        }
        break;
    }
  }, [gameState, playShoot, playExplosion, playLevelUp, gameOver]);

  const handlePanGesture = useCallback((event: any) => {
    const touch = {
      type: 'move',
      delta: {
        pageX: event.nativeEvent.translationX,
      },
    };
    
    // Store the touch for the GameEngine to process
    if (gameEngineRef.current && gameEngineRef.current.touches) {
      gameEngineRef.current.touches = [touch];
    }
  }, []);

  const handlePause = useCallback(() => {
    pauseGame();
    setShowPauseModal(true);
  }, []);

  const handleResume = useCallback(() => {
    resumeGame();
    setShowPauseModal(false);
  }, []);

  const handleRetry = useCallback(() => {
    reset();
    setShowGameOverModal(false);
    startGame();
  }, []);

  const handleHome = useCallback(() => {
    navigation.goBack();
  }, []);

  useEffect(() => {
    startGame();
    
    updateInterval.current = setInterval(() => {
      updateTime();
    }, 100);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  
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

  return (
    <SafeAreaView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <View style={styles.gameContainer}>
          <GameEngine
            ref={gameEngineRef}
            style={styles.gameEngine}
            systems={systems}
            entities={initialEntities}
            onEvent={handleGameEvent}
            running={gameState.status === 'playing'}
          />
          
          <HUD
            score={gameState.score}
            lives={gameState.lives}
            level={gameState.level}
          />
          
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <View style={styles.pauseIcon} />
          </TouchableOpacity>
        </View>
      </PanGestureHandler>

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
    top: hp(2),
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
});
