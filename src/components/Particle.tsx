// === FILE: src/components/Particle.tsx ===
import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ParticleEntity } from '../types/game.types';

export const Particle: React.FC<ParticleEntity> = (entity) => {
  const opacity = new Animated.Value(entity.life);
  
  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: entity.x,
          top: entity.y,
          backgroundColor: entity.color,
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 2,
  },
});
