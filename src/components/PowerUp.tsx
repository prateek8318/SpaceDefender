import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PowerUpType } from '../types/game.types';
import { wp } from '../utils/responsive';

interface PowerUpProps {
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PowerUp: React.FC<PowerUpProps> = memo(({ type, x, y, width, height }) => {
  const getPowerUpConfig = () => {
    switch (type) {
      case 'rapidFire': return { icon: '🔥', color: '#ff4757' };
      case 'multiShot': return { icon: '🔱', color: '#2ed573' };
      case 'timeSlow': return { icon: '❄️', color: '#70a1ff' };
      case 'shieldRecharge': return { icon: '❤️', color: '#2ecc71' };
      case 'shieldRefill': return { icon: '🛡️', color: '#3498db' };
      case 'bombRefill': return { icon: '💣', color: '#e74c3c' };
      default: return { icon: '?', color: '#ffffff' };
    }
  };

  const config = getPowerUpConfig();

  return (
    <View 
      style={[
        styles.container, 
        { left: x, top: y, width, height, borderColor: config.color }
      ]}
    >
      <View style={[styles.glow, { backgroundColor: config.color }]} />
      <Text style={styles.icon}>{config.icon}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 999,
    opacity: 0.25,
  },
  icon: {
    fontSize: wp(4.5),
  },
});
