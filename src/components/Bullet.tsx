// === FILE: src/components/Bullet.tsx ===
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BulletEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

interface BulletProps {
  bullet: BulletEntity;
}

export const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  return (
    <View style={[styles.container, { left: bullet.x, top: bullet.y }]}>
      <View style={styles.bullet} />
      <View style={styles.glow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  bullet: {
    width: 4,
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  glow: {
    position: 'absolute',
    width: 8,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    opacity: 0.3,
    left: -2,
    top: -2,
  },
});
