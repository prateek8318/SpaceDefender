import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SkinType } from '../types/game.types';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';

interface PlayerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  shieldActive?: boolean;
  skin?: SkinType;
  hitKey?: number;
}

export const Player: React.FC<PlayerProps> = memo(({ x, y, width, height, shieldActive, skin = 'scout', hitKey = 0 }) => {
  const hitAnim = useSharedValue(0);

  React.useEffect(() => {
    if (hitKey > 0) {
      hitAnim.value = withSequence(
        withRepeat(withTiming(1, { duration: 100 }), 3, true),
        withTiming(0, { duration: 50 })
      );
    }
  }, [hitKey, hitAnim]);

  const hitEffectStyle = useAnimatedStyle(() => ({
    backgroundColor: hitAnim.value > 0.5 ? '#ff4757' : 'transparent',
    opacity: hitAnim.value,
  }));

  const getSkinColors = () => {
    switch (skin) {
      case 'vanguard': return { primary: '#3498db', secondary: '#2980b9', glow: '#43D7FF' };
      case 'phoenix': return { primary: '#e74c3c', secondary: '#c0392b', glow: '#ff7675' };
      case 'phantom': return { primary: '#9b59b6', secondary: '#8e44ad', glow: '#a29bfe' };
      case 'omega': return { primary: '#f1c40f', secondary: '#f39c12', glow: '#ffeaa7' };
      default: return { primary: '#ecf0f1', secondary: '#bdc3c7', glow: '#ffffff' };
    }
  };

  const colors = getSkinColors();

  return (
    <View style={[styles.container, { left: x, top: y, width, height }]}>
      {shieldActive && (
        <View style={styles.shield} />
      )}
      
      {/* Ship Body */}
      <View style={[styles.shipBody, { backgroundColor: colors.primary }]}>
        {/* Hit Flash Overlay */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.hitFlash, hitEffectStyle]} />
        
        {/* Cockpit */}
        <View style={styles.cockpit} />
        
        {/* Detail Lines */}
        <View style={styles.detailLine} />
        
        {/* Wings */}
        <View style={[styles.wing, styles.leftWing, { borderBottomColor: colors.secondary }]} />
        <View style={[styles.wing, styles.rightWing, { borderBottomColor: colors.secondary }]} />
        
        {/* Engine Glow */}
        <View style={[styles.engine, { backgroundColor: colors.glow }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipBody: {
    width: '60%',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hitFlash: {
    zIndex: 10,
  },
  cockpit: {
    position: 'absolute',
    top: '15%',
    width: '50%',
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  wing: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  leftWing: {
    left: -18,
    bottom: 5,
    transform: [{ rotate: '-35deg' }],
  },
  rightWing: {
    right: -18,
    bottom: 5,
    transform: [{ rotate: '35deg' }],
  },
  engine: {
    position: 'absolute',
    bottom: -10,
    width: '70%',
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  detailLine: {
    position: 'absolute',
    bottom: '25%',
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
  },
  shield: {
    position: 'absolute',
    width: '180%',
    height: '180%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
});
