// === FILE: src/components/HUD.tsx ===
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, level }) => {
  return (
    <View style={styles.container}>
      <View style={styles.livesContainer}>
        <Text style={styles.livesText}>
          {Array.from({ length: Math.max(0, lives) }, () => '❤️').join('')}
        </Text>
      </View>
      
      <View style={styles.levelContainer}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LEVEL {level}</Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    backgroundColor: 'rgba(10, 10, 30, 0.8)',
    zIndex: 1000,
  },
  livesContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  livesText: {
    fontSize: wp(6),
    color: COLORS.danger,
  },
  levelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  levelText: {
    color: COLORS.bg,
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scoreText: {
    color: COLORS.accent,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
});
