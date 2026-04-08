// === FILE: src/hooks/useSounds.ts ===
import { useEffect, useRef } from 'react';

export const useSounds = () => {
  const soundsRef = useRef<{
    shoot?: boolean;
    explosion?: boolean;
    levelup?: boolean;
  }>({});

  useEffect(() => {
    // Sound loading disabled for now
    console.log('Sounds disabled - using empty sound files');
  }, []);

  const playShoot = () => {
    try {
      console.log('Playing shoot sound');
    } catch (error) {
      console.log('Error playing shoot sound:', error);
    }
  };

  const playExplosion = () => {
    try {
      console.log('Playing explosion sound');
    } catch (error) {
      console.log('Error playing explosion sound:', error);
    }
  };

  const playLevelUp = () => {
    try {
      console.log('Playing levelup sound');
    } catch (error) {
      console.log('Error playing levelup sound:', error);
    }
  };

  return { playShoot, playExplosion, playLevelUp };
};
