import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/colors';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const BackgroundStars: React.FC = memo(() => {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.45 + 0.25,
      })),
    [],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map(star => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      <View style={styles.nebulaTop} />
      <View style={styles.nebulaBottom} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 999,
  },
  nebulaTop: {
    position: 'absolute',
    top: '-8%',
    left: '-15%',
    width: '70%',
    height: '28%',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 180, 255, 0.08)',
  },
  nebulaBottom: {
    position: 'absolute',
    bottom: '-10%',
    right: '-12%',
    width: '65%',
    height: '24%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 80, 80, 0.08)',
  },
});
