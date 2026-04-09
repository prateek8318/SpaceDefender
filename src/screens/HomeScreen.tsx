// === FILE: src/screens/HomeScreen.tsx ===
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp, screenWidthPx, screenHeightPx } from '../utils/responsive';
import { useHighScore } from '../hooks/useHighScore';

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
  const animationRef = useRef<number | null>(null);
  
  // Animation values
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const scoreCardAnim = useRef(new Animated.Value(0)).current;
  const playButtonAnim = useRef(new Animated.Value(0)).current;
  const leaderboardButtonAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * screenWidthPx,
      y: Math.random() * screenHeightPx,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(initialStars);

    const animate = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          y: star.y + star.speed,
          ...(star.y > screenHeightPx ? { y: -10, x: Math.random() * screenWidthPx } : {})
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Refresh best score when screen becomes focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshBestScore();
      // Start entrance animations
      startEntranceAnimations();
    });

    return unsubscribe;
  }, [navigation, refreshBestScore]);

  // Entrance animations - simplified for performance
  const startEntranceAnimations = () => {
    // Set all animations to 1 immediately (no delay)
    titleAnim.setValue(1);
    subtitleAnim.setValue(1);
    scoreCardAnim.setValue(1);
    playButtonAnim.setValue(1);
    leaderboardButtonAnim.setValue(1);
    glowAnim.setValue(1);
  };

  useEffect(() => {
    startEntranceAnimations();
  }, []);

  const handlePlay = () => {
    navigation.navigate('LevelSelect' as never);
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard' as never);
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

      {/* Main content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SPACE DEFENDER</Text>
          <Text style={styles.subtitle}>DEFEND EARTH FROM THE ALIEN INVASION</Text>
        </View>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardInner}>
            <Text style={styles.scoreLabel}>BEST SCORE</Text>
            <Text style={styles.scoreValue}>
              {loading ? '...' : bestScore.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Buttons container */}
        <View style={styles.buttonContainer}>
          {/* Play button */}
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={handlePlay}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          {/* Leaderboard button */}
          <TouchableOpacity 
            style={styles.leaderboardButton} 
            onPress={handleLeaderboard}
          >
            <Text style={styles.leaderboardButtonText}>LEADERBOARD</Text>
          </TouchableOpacity>
        </View>

      </View>
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
    position: 'relative',
  },
  scoreCardInner: {
    backgroundColor: 'rgba(93, 202, 165, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: wp(4),
    padding: wp(6),
    alignItems: 'center',
  },
  scoreCardGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    opacity: 0.1,
    filter: 'blur(20px)',
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
    gap: hp(4),
    zIndex: 10,
  },
  playButtonWrapper: {
    width: '100%',
  },
  playButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: hp(3.5),
    borderRadius: wp(4),
    alignItems: 'center',
  },
  playButtonGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    opacity: 0.3,
    filter: 'blur(30px)',
  },
  playButtonText: {
    color: COLORS.bg,
    fontSize: wp(6),
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
  },
  leaderboardButtonWrapper: {
    width: '100%',
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
