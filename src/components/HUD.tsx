// === FILE: src/components/HUD.tsx ===
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, level }) => {
  // Animation values
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const livesAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate score changes
  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [score]);

  // Animate lives changes
  useEffect(() => {
    Animated.timing(livesAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [lives]);

  // Animate level changes
  useEffect(() => {
    Animated.timing(levelAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [level]);

  // Continuous pulse animation for level badge
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Lives Section */}
      <Animated.View
        style={[
          styles.livesContainer,
          {
            opacity: livesAnim,
            transform: [{ scale: livesAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })}],
          },
        ]}
      >
        <View style={styles.livesCard}>
          <Text style={styles.livesLabel}>LIVES</Text>
          <View style={styles.heartsContainer}>
            {Array.from({ length: Math.max(0, lives) }, (_, i) => (
              <Text key={i} style={styles.heartIcon}>❤️</Text>
            ))}
            {Array.from({ length: Math.max(0, 3 - lives) }, (_, i) => (
              <Text key={`empty-${i}`} style={styles.emptyHeartIcon}>🖤</Text>
            ))}
          </View>
        </View>
      </Animated.View>
      
      {/* Level Section */}
      <Animated.View
        style={[
          styles.levelContainer,
          {
            opacity: levelAnim,
            transform: [
              { scale: pulseAnim },
              { translateY: levelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              })},
            ],
          },
        ]}
      >
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LEVEL {level}</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Score Section */}
      <Animated.View
        style={[
          styles.scoreContainer,
          {
            opacity: scoreAnim,
            transform: [{ scale: scoreAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })}],
          },
        ]}
      >
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    zIndex: 1000,
  },
  livesContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  livesCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    alignItems: 'center',
  },
  livesLabel: {
    color: COLORS.muted,
    fontSize: wp(2.5),
    fontWeight: '600',
    marginBottom: hp(0.5),
    letterSpacing: 1,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: wp(5),
    marginHorizontal: wp(0.5),
  },
  emptyHeartIcon: {
    fontSize: wp(5),
    marginHorizontal: wp(0.5),
    opacity: 0.3,
  },
  levelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  levelCard: {
    position: 'relative',
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(3),
  },
  levelGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    opacity: 0.2,
    filter: 'blur(20px)',
  },
  levelText: {
    color: COLORS.bg,
    fontSize: wp(4),
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    alignItems: 'center',
  },
  scoreGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: COLORS.accent,
    borderRadius: wp(4),
    opacity: 0.15,
    filter: 'blur(15px)',
  },
  scoreLabel: {
    color: COLORS.muted,
    fontSize: wp(2.5),
    fontWeight: '600',
    marginBottom: hp(0.5),
    letterSpacing: 1,
  },
  scoreText: {
    color: COLORS.accent,
    fontSize: wp(5),
    fontWeight: '900',
  },
});
