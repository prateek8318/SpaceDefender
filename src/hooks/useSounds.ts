// === FILE: src/hooks/useSounds.ts ===
import { useEffect, useRef } from 'react';

export const useSounds = () => {
  const soundsRef = useRef<{
    shoot?: boolean;
    explosion?: boolean;
    levelup?: boolean;
  }>({});

  useEffect(() => {
    soundsRef.current = {};
  }, []);

  const playShoot = () => {};
  const playExplosion = () => {};
  const playLevelUp = () => {};

  return { playShoot, playExplosion, playLevelUp };
};
