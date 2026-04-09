// === FILE: src/components/Bullet.tsx ===
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BulletEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

export const Bullet: React.FC<BulletEntity> = memo((entity) => {
  const hostile = (entity as BulletEntity & { hostile?: boolean }).hostile;

  return (
    <View style={[styles.container, { left: entity.x, top: entity.y }]}>
      {/* Energy aura effect */}
      <View style={[styles.energyAura, hostile && styles.enemyAura]} />
      <View style={[styles.energyCore, hostile && styles.enemyCore]} />
      
      {/* Plasma glow layers */}
      <View style={[styles.plasmaGlow, hostile && styles.enemyGlow]} />
      <View style={[styles.plasmaInner, hostile && styles.enemyInner]} />
      
      {/* Main energy bolt */}
      <View style={[styles.energyBolt, hostile && styles.enemyBolt]} />
      <View style={[styles.energyCore, hostile && styles.enemyCore]} />
      
      {/* Power trail */}
      <View style={[styles.powerTrail, hostile && styles.enemyTrail]} />
      <View style={[styles.trailParticles, hostile && styles.enemyTrailParticles]} />
      
      {/* Impact glow */}
      <View style={[styles.impactGlow, hostile && styles.enemyImpactGlow]} />
    </View>
  );
});

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
  enemyAura: {
    backgroundColor: COLORS.glowRed,
  },
  enemyCore: {
    backgroundColor: COLORS.accentBright,
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
  enemyGlow: {
    backgroundColor: COLORS.glowPurple,
  },
  enemyInner: {
    backgroundColor: COLORS.accent,
  },
  // Main energy bolt
  energyBolt: {
    position: 'absolute',
    width: 6,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  enemyBolt: {
    backgroundColor: COLORS.danger,
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
  enemyTrail: {
    backgroundColor: COLORS.glowRed,
    top: 18,
  },
  enemyTrailParticles: {
    backgroundColor: COLORS.accentBright,
    top: 20,
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
  enemyImpactGlow: {
    backgroundColor: COLORS.accent,
  },
});
