// === FILE: src/components/Player.tsx ===
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export const Player: React.FC<any> = memo((props) => {
  if (!props) {
    return null;
  }
  
  return (
    <View style={[styles.container, { left: props.x, top: props.y }]}>
      {/* Energy shield effect */}
      <View style={styles.energyShield} />
      <View style={styles.energyShieldInner} />
      
      {/* Main thruster glow */}
      <View style={styles.mainThruster} />
      <View style={styles.thrusterCore} />
      
      {/* Left engine wing */}
      <View style={styles.leftWingMain} />
      <View style={styles.leftWingTip} />
      <View style={styles.leftEngine} />
      
      {/* Right engine wing */}
      <View style={styles.rightWingMain} />
      <View style={styles.rightWingTip} />
      <View style={styles.rightEngine} />
      
      {/* Central fuselage */}
      <View style={styles.fuselage} />
      <View style={styles.fuselageHighlight} />
      <View style={styles.fuselageArmor} />
      
      {/* Advanced cockpit */}
      <View style={styles.cockpitFrame} />
      <View style={styles.cockpitGlass} />
      <View style={styles.cockpitLight} />
      
      {/* Weapon systems */}
      <View style={styles.leftCannon} />
      <View style={styles.rightCannon} />
      <View style={styles.cannonGlow} />
      
      {/* Engine exhaust */}
      <View style={styles.exhaustMain} />
      <View style={styles.exhaustFlame} />
      <View style={styles.exhaustParticles} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 70,
  },
  // Energy shield effects
  energyShield: {
    position: 'absolute',
    width: 70,
    height: 80,
    backgroundColor: COLORS.glowCyan,
    borderRadius: 35,
    opacity: 0.2,
    left: -5,
    top: -5,
  },
  energyShieldInner: {
    position: 'absolute',
    width: 65,
    height: 75,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 33,
    opacity: 0.3,
    left: -2.5,
    top: -2.5,
  },
  // Main thruster system
  mainThruster: {
    position: 'absolute',
    width: 30,
    height: 15,
    backgroundColor: COLORS.glowOrange,
    borderRadius: 15,
    left: 15,
    bottom: 5,
    opacity: 0.7,
  },
  thrusterCore: {
    position: 'absolute',
    width: 18,
    height: 10,
    backgroundColor: COLORS.white,
    borderRadius: 9,
    left: 21,
    bottom: 7.5,
    opacity: 0.9,
  },
  // Advanced wing systems
  leftWingMain: {
    position: 'absolute',
    width: 30,
    height: 10,
    backgroundColor: COLORS.primary,
    left: -8,
    top: 30,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 15,
    transform: [{ rotate: '-20deg' }],
  },
  leftWingTip: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: COLORS.accentBright,
    left: -12,
    top: 33,
    borderRadius: 5,
  },
  leftEngine: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.glowCyan,
    left: -5,
    top: 31,
    borderRadius: 4,
    opacity: 0.8,
  },
  rightWingMain: {
    position: 'absolute',
    width: 30,
    height: 10,
    backgroundColor: COLORS.primary,
    right: -8,
    top: 30,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 15,
    transform: [{ rotate: '20deg' }],
  },
  rightWingTip: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: COLORS.accentBright,
    right: -12,
    top: 33,
    borderRadius: 5,
  },
  rightEngine: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.glowCyan,
    right: -5,
    top: 31,
    borderRadius: 4,
    opacity: 0.8,
  },
  // Advanced fuselage
  fuselage: {
    position: 'absolute',
    width: 40,
    height: 45,
    backgroundColor: COLORS.primary,
    left: 10,
    top: 15,
    borderRadius: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: COLORS.glowCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fuselageHighlight: {
    position: 'absolute',
    width: 25,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    left: 17.5,
    top: 22.5,
    borderRadius: 12,
  },
  fuselageArmor: {
    position: 'absolute',
    width: 35,
    height: 8,
    backgroundColor: COLORS.accent,
    left: 12.5,
    top: 25,
    borderRadius: 4,
    opacity: 0.8,
  },
  // Advanced cockpit
  cockpitFrame: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: COLORS.textBright,
    left: 22,
    top: 28,
    borderRadius: 8,
  },
  cockpitGlass: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: COLORS.glowCyan,
    left: 24,
    top: 30,
    borderRadius: 6,
    opacity: 0.7,
  },
  cockpitLight: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: COLORS.white,
    left: 27,
    top: 33,
    borderRadius: 3,
  },
  // Weapon systems
  leftCannon: {
    position: 'absolute',
    width: 6,
    height: 12,
    backgroundColor: COLORS.danger,
    left: 8,
    top: 20,
    borderRadius: 3,
  },
  rightCannon: {
    position: 'absolute',
    width: 6,
    height: 12,
    backgroundColor: COLORS.danger,
    right: 8,
    top: 20,
    borderRadius: 3,
  },
  cannonGlow: {
    position: 'absolute',
    width: 4,
    height: 8,
    backgroundColor: COLORS.glowRed,
    left: 28,
    top: 22,
    borderRadius: 2,
    opacity: 0.8,
  },
  // Advanced exhaust system
  exhaustMain: {
    position: 'absolute',
    width: 25,
    height: 8,
    backgroundColor: COLORS.dangerDark,
    left: 17.5,
    bottom: 0,
    borderRadius: 4,
    opacity: 0.8,
  },
  exhaustFlame: {
    position: 'absolute',
    width: 15,
    height: 5,
    backgroundColor: COLORS.accentBright,
    left: 22.5,
    bottom: 1.5,
    borderRadius: 3,
    opacity: 0.9,
  },
  exhaustParticles: {
    position: 'absolute',
    width: 8,
    height: 3,
    backgroundColor: COLORS.white,
    left: 26,
    bottom: 2.5,
    borderRadius: 2,
    opacity: 0.8,
  },
});
