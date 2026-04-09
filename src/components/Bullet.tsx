// === FILE: src/components/Bullet.tsx ===
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BulletEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

export const Bullet: React.FC<BulletEntity> = (entity) => {
  return (
    <View style={[styles.container, { left: entity.x, top: entity.y }]}>
      {/* Energy aura effect */}
      <View style={styles.energyAura} />
      <View style={styles.energyCore} />
      
      {/* Plasma glow layers */}
      <View style={styles.plasmaGlow} />
      <View style={styles.plasmaInner} />
      
      {/* Main energy bolt */}
      <View style={styles.energyBolt} />
      <View style={styles.energyCore} />
      
      {/* Power trail */}
      <View style={styles.powerTrail} />
      <View style={styles.trailParticles} />
      
      {/* Impact glow */}
      <View style={styles.impactGlow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  // Energy aura effects
  energyAura: {
    position: 'absolute',
    width: 16,
    height: 25,
    backgroundColor: COLORS.glowCyan,
    borderRadius: 8,
    opacity: 0.4,
    left: -5.5,
    top: -5,
  },
  energyCore: {
    position: 'absolute',
    width: 12,
    height: 20,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    opacity: 0.6,
    left: -3.5,
    top: -2.5,
  },
  // Plasma glow layers
  plasmaGlow: {
    position: 'absolute',
    width: 10,
    height: 18,
    backgroundColor: COLORS.glowOrange,
    borderRadius: 5,
    opacity: 0.5,
    left: -2.5,
    top: -1.5,
  },
  plasmaInner: {
    position: 'absolute',
    width: 8,
    height: 16,
    backgroundColor: COLORS.accentBright,
    borderRadius: 4,
    opacity: 0.7,
    left: -1.5,
    top: -0.5,
  },
  // Main energy bolt
  energyBolt: {
    position: 'absolute',
    width: 6,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  // Power trail effects
  powerTrail: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: COLORS.glowCyan,
    borderRadius: 2,
    left: 1,
    top: -12,
    opacity: 0.8,
  },
  trailParticles: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 1,
    left: 2,
    top: -8,
    opacity: 0.9,
  },
  // Impact glow
  impactGlow: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    left: -1,
    top: 5,
    opacity: 0.7,
  },
});
