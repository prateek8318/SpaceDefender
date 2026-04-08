// === FILE: src/components/Enemy.tsx ===
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EnemyEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

interface EnemyProps {
  enemy: EnemyEntity;
}

export const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const getEnemyStyle = () => {
    switch (enemy.type) {
      case 'basic':
        return styles.basic;
      case 'fast':
        return styles.fast;
      case 'tank':
        return styles.tank;
      case 'boss':
        return styles.boss;
      default:
        return styles.basic;
    }
  };

  const getEnemyColor = () => {
    switch (enemy.type) {
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
    <View style={[styles.container, { left: enemy.x, top: enemy.y }]}>
      <View style={[getEnemyStyle(), { backgroundColor: getEnemyColor() }]} />
      {enemy.type === 'tank' && enemy.hp > 1 && (
        <Text style={styles.hpText}>{enemy.hp}</Text>
      )}
      {enemy.type === 'boss' && (
        <View style={styles.bossAccent} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  basic: {
    width: 30,
    height: 30,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  fast: {
    width: 25,
    height: 35,
    borderRadius: 12,
  },
  tank: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  boss: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  bossAccent: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    left: 10,
    top: 10,
    opacity: 0.6,
  },
  hpText: {
    position: 'absolute',
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
