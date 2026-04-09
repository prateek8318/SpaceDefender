// === FILE: src/screens/HomeScreen.tsx ===
import React, { useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { hp, screenHeightPx, screenWidthPx, wp } from '../utils/responsive';
import { useHighScore } from '../hooks/useHighScore';
import { ExitConfirmationModal } from '../components/ExitConfirmationModal';
import { soundManager } from '../utils/SoundManager';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { bestScore, loading, refreshBestScore } = useHighScore();
  const [stars, setStars] = useState<Star[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * screenWidthPx,
      y: Math.random() * screenHeightPx,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setStars(initialStars);

    const animate = () => {
      setStars(prevStars =>
        prevStars.map(star => ({
          ...star,
          y: star.y + star.speed,
          ...(star.y > screenHeightPx ? { y: -10, x: Math.random() * screenWidthPx } : {}),
        })),
      );
    };

    const intervalId = setInterval(animate, 120);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshBestScore();
      soundManager.playBackgroundMusic(true);
    });

    return unsubscribe;
  }, [navigation, refreshBestScore]);

  useEffect(() => {
    soundManager.playBackgroundMusic(true);

    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handlePlay = () => {
    navigation.navigate('LevelSelect' as never);
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard' as never);
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated background stars */}
      {stars.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SPACE DEFENDER</Text>
          <Text style={styles.subtitle}>DEFEND EARTH FROM THE ALIEN INVASION</Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreCardInner}>
            <Text style={styles.scoreLabel}>BEST SCORE</Text>
            <Text style={styles.scoreValue}>
              {loading ? '...' : bestScore.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.7}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaderboardButton} onPress={handleLeaderboard} activeOpacity={0.7}>
            <Text style={styles.leaderboardButtonText}>LEADERBOARD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ExitConfirmationModal
        visible={showExitModal}
        onExit={handleExit}
        onCancel={handleCancelExit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: hp(8),
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(12),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: hp(2),
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: wp(4),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreCard: {
    marginBottom: hp(8),
  },
  scoreCardInner: {
    backgroundColor: 'rgba(93, 202, 165, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: wp(4),
    padding: wp(6),
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.text,
    fontSize: wp(4),
    marginBottom: hp(1),
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreValue: {
    color: COLORS.accent,
    fontSize: wp(8),
    fontWeight: '900',
  },
  buttonContainer: {
    width: '100%',
    gap: hp(3),
    zIndex: 10,
  },
  playButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: hp(3.5),
    borderRadius: wp(4),
    alignItems: 'center',
  },
  playButtonText: {
    color: COLORS.bg,
    fontSize: wp(6),
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  leaderboardButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: hp(3),
    borderRadius: wp(4),
    alignItems: 'center',
  },
  leaderboardButtonText: {
    color: COLORS.text,
    fontSize: wp(5),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
