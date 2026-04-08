// === FILE: src/screens/HomeScreen.tsx ===
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
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
  const { bestScore, loading } = useHighScore();
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number | null>(null);

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

  const handlePlay = () => {
    navigation.navigate('LevelSelect' as never);
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>SPACE DEFENDER</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>BEST SCORE</Text>
          <Text style={styles.scoreValue}>
            {loading ? '...' : bestScore.toLocaleString()}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaderboardButton} onPress={handleLeaderboard}>
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
    backgroundColor: COLORS.bg,
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
  title: {
    color: COLORS.primary,
    fontSize: wp(10),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(8),
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreContainer: {
    backgroundColor: 'rgba(93, 202, 165, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: wp(4),
    padding: wp(6),
    marginBottom: hp(8),
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.muted,
    fontSize: wp(3.5),
    marginBottom: hp(1),
  },
  scoreValue: {
    color: COLORS.accent,
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: hp(3),
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(3),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  playButtonText: {
    color: COLORS.bg,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  leaderboardButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.muted,
    paddingVertical: hp(3),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  leaderboardButtonText: {
    color: COLORS.text,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
});
