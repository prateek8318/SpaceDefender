import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface ParticleProps {
  id: string;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  color: string;
  size: number;
}

export const Particle: React.FC<ParticleProps> = memo(({ x, y, opacity, scale, color, size }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    backgroundColor: color,
    width: size,
    height: size,
    borderRadius: size / 2,
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    zIndex: 5,
  },
});
