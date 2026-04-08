// === FILE: src/components/Particle.tsx ===
import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ParticleEntity } from '../types/game.types';

interface ParticleProps {
  particle: ParticleEntity;
}

export const Particle: React.FC<ParticleProps> = ({ particle }) => {
  const opacity = new Animated.Value(particle.life);
  
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
          left: particle.x,
          top: particle.y,
          backgroundColor: particle.color,
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
