import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/colors';
import { hp, wp } from '../utils/responsive';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, level }) => {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const livesAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scoreAnim.setValue(0);
    Animated.timing(scoreAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [score, scoreAnim]);

  useEffect(() => {
    livesAnim.setValue(0);
    Animated.timing(livesAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [lives, livesAnim]);

  useEffect(() => {
    levelAnim.setValue(0);
    Animated.timing(levelAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [level, levelAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sideContainer,
          {
            opacity: livesAnim,
            transform: [
              {
                scale: livesAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.label}>LIVES</Text>
          <Text style={styles.value}>{`${Math.max(0, lives)}/3`}</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.centerContainer,
          {
            opacity: levelAnim,
            transform: [
              { scale: pulseAnim },
              {
                translateY: levelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LEVEL {level}</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.sideContainer,
          {
            opacity: scoreAnim,
            transform: [
              {
                scale: scoreAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.value}>{score.toLocaleString()}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    zIndex: 1000,
  },
  sideContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: wp(2.8),
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: '900',
    marginTop: hp(0.5),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    borderRadius: wp(5),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '900',
    letterSpacing: 2,
  },
});
