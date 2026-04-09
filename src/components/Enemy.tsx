import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EnemyEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

export const Enemy: React.FC<EnemyEntity> = memo((entity) => {
  const frameStyle =
    entity.type === 'boss'
      ? styles.bossFrame
      : entity.type === 'tank'
        ? styles.tankFrame
        : entity.type === 'fast'
          ? styles.fastFrame
          : styles.basicFrame;

  const coreStyle =
    entity.type === 'boss'
      ? styles.bossCore
      : entity.type === 'tank'
        ? styles.tankCore
        : entity.type === 'fast'
          ? styles.fastCore
          : styles.basicCore;

  return (
    <View style={[styles.container, { left: entity.x, top: entity.y, width: entity.width, height: entity.height }]}>
      <View style={[styles.frame, frameStyle]}>
        <View style={[styles.core, coreStyle]} />
        <View style={styles.cockpit} />
        <View style={styles.leftWing} />
        <View style={styles.rightWing} />
        <View style={styles.weaponBar} />
        <View style={styles.engineStrip} />
      </View>
      {entity.hp > 1 && (
        <View style={styles.hpBadge}>
          <Text style={styles.hpText}>{entity.hp}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicFrame: {
    backgroundColor: '#3A0C10',
    borderColor: '#FF5A66',
    borderRadius: 14,
    transform: [{ rotate: '45deg' }],
  },
  fastFrame: {
    backgroundColor: '#071A22',
    borderColor: '#43D7FF',
    borderRadius: 18,
  },
  tankFrame: {
    backgroundColor: '#23122D',
    borderColor: '#A86BFF',
    borderRadius: 12,
  },
  bossFrame: {
    backgroundColor: '#1A0E28',
    borderColor: '#FF5C93',
    borderRadius: 18,
  },
  core: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '18%',
    bottom: '18%',
    borderRadius: 10,
  },
  basicCore: {
    backgroundColor: '#FF3A4E',
  },
  fastCore: {
    backgroundColor: '#00BEEA',
  },
  tankCore: {
    backgroundColor: '#8A52FF',
  },
  bossCore: {
    backgroundColor: '#B147FF',
  },
  cockpit: {
    position: 'absolute',
    width: '22%',
    height: '22%',
    borderRadius: 999,
    backgroundColor: COLORS.white,
    top: '22%',
  },
  leftWing: {
    position: 'absolute',
    width: '12%',
    height: '24%',
    left: '10%',
    top: '24%',
    borderRadius: 999,
    backgroundColor: COLORS.dangerDark,
  },
  rightWing: {
    position: 'absolute',
    width: '12%',
    height: '24%',
    right: '10%',
    top: '24%',
    borderRadius: 999,
    backgroundColor: COLORS.dangerDark,
  },
  weaponBar: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: '54%',
    height: '10%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  engineStrip: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    bottom: '10%',
    height: '12%',
    borderRadius: 999,
    backgroundColor: COLORS.glowOrange,
  },
  hpBadge: {
    position: 'absolute',
    bottom: -12,
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
  },
  hpText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
});
