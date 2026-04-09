import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const BackgroundStars: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate fewer stars for better performance
    const initialStars: Star[] = [];
    for (let i = 0; i < 20; i++) { // Reduced from 50 to 20
      initialStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5, // Smaller stars
        opacity: Math.random() * 0.6 + 0.2, // Lower opacity
      });
    }
    setStars(initialStars);
  }, []);

  useEffect(() => {
    let lastUpdate = Date.now();
    const animateStars = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdate;
      
      if (deltaTime > 100) { // Update every 100ms instead of continuous
        setStars(prevStars => 
          prevStars.map(star => ({
            ...star,
            y: star.y >= 100 ? -5 : star.y + 0.5, // Simple downward movement
          }))
        );
        lastUpdate = now;
      }
      
      animationRef.current = requestAnimationFrame(animateStars);
    };

    animationRef.current = requestAnimationFrame(animateStars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
});
