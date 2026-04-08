// === FILE: src/components/Player.tsx ===
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

interface PlayerProps {
  player: PlayerEntity;
}

export const Player: React.FC<PlayerProps> = ({ player }) => {
  if (!player) {
    return null;
  }
  
  return (
    <View style={[styles.container, { left: player.x, top: player.y }]}>
      <View style={styles.engineGlow} />
      <View style={styles.mainBody} />
      <View style={styles.cockpit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 40,
    height: 50,
  },
  mainBody: {
    position: 'absolute',
    width: 30,
    height: 35,
    backgroundColor: COLORS.primary,
    left: 5,
    top: 10,
    borderRadius: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  engineGlow: {
    position: 'absolute',
    width: 20,
    height: 8,
    backgroundColor: COLORS.accent,
    left: 10,
    bottom: 5,
    borderRadius: 4,
    opacity: 0.8,
  },
  cockpit: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    left: 16,
    top: 20,
    borderRadius: 4,
  },
});
