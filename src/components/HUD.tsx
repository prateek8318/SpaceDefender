import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/colors';
import { hp, wp } from '../utils/responsive';

import { PowerUpType } from '../types/game.types';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  multiplier: number;
  combo: number;
  activePowerUp: PowerUpType | null;
  powerUpTime: number;
  coins: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, level, multiplier, combo, activePowerUp, powerUpTime, coins }) => {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const livesAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(0)).current;
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
    if (combo > 0) {
      comboAnim.setValue(0);
      Animated.spring(comboAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [combo, comboAnim]);

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

  const getMultiplierColor = () => {
    if (multiplier >= 8) return '#f1c40f'; // Gold
    if (multiplier >= 4) return '#e67e22'; // Orange
    if (multiplier >= 2) return '#3498db'; // Blue
    return 'transparent';
  };

  const getPowerUpConfig = () => {
    switch (activePowerUp) {
      case 'rapidFire': return { label: 'RAPID FIRE', color: '#ff4757', max: 8000 };
      case 'multiShot': return { label: 'MULTI-SHOT', color: '#2ed573', max: 10000 };
      case 'timeSlow': return { label: 'TIME SLOW', color: '#70a1ff', max: 6000 };
      default: return null;
    }
  };

  const pwr = getPowerUpConfig();

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
        <View style={[styles.card, { marginTop: hp(1) }]}>
          <Text style={styles.label}>COINS</Text>
          <Text style={[styles.value, { color: '#f1c40f' }]}>🪙 {coins.toLocaleString()}</Text>
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

        {pwr && (
          <View style={styles.powerUpPill}>
            <Text style={styles.powerUpLabel}>{pwr.label}</Text>
            <View style={styles.powerUpBarBg}>
              <View 
                style={[
                  styles.powerUpBarFill, 
                  { 
                    backgroundColor: pwr.color,
                    width: `${(powerUpTime / pwr.max) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </Animated.View>

      <View style={styles.rightSideContainer}>
        <Animated.View
          style={[
            styles.card,
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
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.value}>{score.toLocaleString()}</Text>
        </Animated.View>

        {combo > 0 && (
          <Animated.View 
            style={[
              styles.comboContainer,
              {
                opacity: comboAnim,
                transform: [{ scale: comboAnim }]
              }
            ]}
          >
            <Text style={styles.comboText}>{combo} COMBO</Text>
            {multiplier > 1 && (
              <View style={[styles.multiplierBadge, { backgroundColor: getMultiplierColor() }]}>
                <Text style={styles.multiplierText}>x{multiplier}</Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>
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
  rightSideContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
  },
  comboContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  comboText: {
    color: '#3498db',
    fontSize: wp(3.5),
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  multiplierBadge: {
    marginLeft: wp(2),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(1),
  },
  multiplierText: {
    color: '#000',
    fontSize: wp(3),
    fontWeight: '900',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: wp(2.8),
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  powerUpPill: {
    marginTop: hp(1.5),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    alignItems: 'center',
    width: wp(35),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  powerUpLabel: {
    color: '#fff',
    fontSize: wp(2.5),
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: hp(0.5),
  },
  powerUpBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  powerUpBarFill: {
    height: '100%',
    borderRadius: 2,
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
