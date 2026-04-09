// === FILE: src/components/Enemy.tsx ===
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EnemyEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

export const Enemy: React.FC<EnemyEntity> = (entity) => {
  const getEnemyColor = () => {
    switch (entity.type) {
      case 'basic':
        return COLORS.danger;
      case 'fast':
        return COLORS.accent;
      case 'tank':
        return COLORS.purple;
      case 'boss':
        return COLORS.purple;
      default:
        return COLORS.danger;
    }
  };

  return (
    <View style={[styles.container, { left: entity.x, top: entity.y }]}>
      {entity.type === 'basic' && (
        <>
          {/* Main body with menacing design */}
          <View style={[styles.basicBody, { backgroundColor: getEnemyColor() }]} />
          <View style={styles.basicCore} />
          <View style={styles.basicSpikes} />
          <View style={styles.basicArmor} />
          <View style={styles.basicEngine} />
          <View style={styles.basicGlow} />
        </>
      )}
      
      {entity.type === 'fast' && (
        <>
          {/* Sleek but dangerous design */}
          <View style={[styles.fastBody, { backgroundColor: getEnemyColor() }]} />
          <View style={styles.fastWingLeft} />
          <View style={styles.fastWingRight} />
          <View style={styles.fastEngine} />
          <View style={styles.fastCockpit} />
          <View style={styles.fastTrail} />
        </>
      )}
      
      {entity.type === 'tank' && (
        <>
          {/* Heavy armored design */}
          <View style={[styles.tankBody, { backgroundColor: getEnemyColor() }]} />
          <View style={styles.tankArmor} />
          <View style={styles.tankCore} />
          <View style={styles.tankPlating} />
          <View style={styles.tankWeapons} />
          <View style={styles.tankEngines} />
          {entity.hp > 1 && <Text style={styles.hpText}>{entity.hp}</Text>}
        </>
      )}
      
      {entity.type === 'boss' && (
        <>
          {/* Massive intimidating warship */}
          <View style={[styles.bossBody, { backgroundColor: getEnemyColor() }]} />
          <View style={styles.bossWingLeft} />
          <View style={styles.bossWingRight} />
          <View style={styles.bossCore} />
          <View style={styles.bossCannon} />
          <View style={styles.bossAccent} />
          <View style={styles.bossArmor} />
          <View style={styles.bossEngines} />
          <View style={styles.bossWeapons} />
          <View style={styles.bossAura} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  // Basic enemy - menacing spiked design
  basicBody: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 10,
    transform: [{ rotate: '45deg' }],
  },
  basicCore: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: COLORS.glowRed,
    left: 11.5,
    top: 11.5,
    borderRadius: 6,
    opacity: 0.9,
  },
  basicSpikes: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    left: -2.5,
    top: -2.5,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.dangerDark,
    opacity: 0.8,
  },
  basicArmor: {
    position: 'absolute',
    width: 25,
    height: 25,
    backgroundColor: 'transparent',
    left: 5,
    top: 5,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.danger,
    opacity: 0.6,
  },
  basicEngine: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: COLORS.glowOrange,
    left: 14.5,
    bottom: 3,
    borderRadius: 3,
    opacity: 0.8,
  },
  basicGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    backgroundColor: COLORS.danger,
    borderRadius: 21,
    left: -3.5,
    top: -3.5,
    opacity: 0.2,
  },
  // Fast enemy - sleek dangerous design
  fastBody: {
    position: 'absolute',
    width: 28,
    height: 40,
    borderRadius: 14,
  },
  fastWingLeft: {
    position: 'absolute',
    width: 18,
    height: 10,
    backgroundColor: COLORS.dangerDark,
    left: -10,
    top: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 3,
    transform: [{ rotate: '-25deg' }],
  },
  fastWingRight: {
    position: 'absolute',
    width: 18,
    height: 10,
    backgroundColor: COLORS.dangerDark,
    right: -10,
    top: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 3,
    transform: [{ rotate: '25deg' }],
  },
  fastEngine: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: COLORS.glowOrange,
    left: 9,
    bottom: 2,
    borderRadius: 5,
    opacity: 0.9,
  },
  fastCockpit: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.glowRed,
    left: 10,
    top: 16,
    borderRadius: 4,
    opacity: 0.8,
  },
  fastTrail: {
    position: 'absolute',
    width: 4,
    height: 15,
    backgroundColor: COLORS.accentBright,
    left: 12,
    top: -15,
    borderRadius: 2,
    opacity: 0.6,
  },
  // Tank enemy - heavily armored design
  tankBody: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 12,
  },
  tankArmor: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    left: 2.5,
    top: 2.5,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.dangerDark,
    opacity: 0.8,
  },
  tankCore: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: COLORS.glowPurple,
    left: 15,
    top: 15,
    borderRadius: 8,
    opacity: 0.9,
  },
  tankPlating: {
    position: 'absolute',
    width: 35,
    height: 8,
    backgroundColor: COLORS.danger,
    left: 5,
    top: 18.5,
    borderRadius: 4,
    opacity: 0.9,
  },
  tankWeapons: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.glowRed,
    left: 18.5,
    top: 5,
    borderRadius: 4,
  },
  tankEngines: {
    position: 'absolute',
    width: 12,
    height: 6,
    backgroundColor: COLORS.glowOrange,
    left: 16.5,
    bottom: 2,
    borderRadius: 3,
    opacity: 0.8,
  },
  // Boss enemy - massive intimidating warship
  bossBody: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 18,
  },
  bossWingLeft: {
    position: 'absolute',
    width: 30,
    height: 18,
    backgroundColor: COLORS.dangerDark,
    left: -18,
    top: 26,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 10,
    transform: [{ rotate: '-30deg' }],
  },
  bossWingRight: {
    position: 'absolute',
    width: 30,
    height: 18,
    backgroundColor: COLORS.dangerDark,
    right: -18,
    top: 26,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '30deg' }],
  },
  bossCore: {
    position: 'absolute',
    width: 25,
    height: 25,
    backgroundColor: COLORS.glowPurple,
    left: 22.5,
    top: 22.5,
    borderRadius: 12,
    opacity: 0.9,
  },
  bossCannon: {
    position: 'absolute',
    width: 10,
    height: 30,
    backgroundColor: COLORS.danger,
    left: 30,
    bottom: -15,
    borderRadius: 5,
  },
  bossAccent: {
    position: 'absolute',
    width: 55,
    height: 55,
    backgroundColor: COLORS.purpleLight,
    borderRadius: 15,
    left: 7.5,
    top: 7.5,
    opacity: 0.5,
  },
  bossArmor: {
    position: 'absolute',
    width: 60,
    height: 12,
    backgroundColor: COLORS.dangerDark,
    left: 5,
    top: 29,
    borderRadius: 6,
    opacity: 0.9,
  },
  bossEngines: {
    position: 'absolute',
    width: 20,
    height: 8,
    backgroundColor: COLORS.glowOrange,
    left: 25,
    bottom: 2,
    borderRadius: 4,
    opacity: 0.8,
  },
  bossWeapons: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: COLORS.glowRed,
    left: 29,
    top: 8,
    borderRadius: 6,
  },
  bossAura: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: COLORS.glowPurple,
    borderRadius: 40,
    left: -5,
    top: -5,
    opacity: 0.3,
  },
  hpText: {
    position: 'absolute',
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
