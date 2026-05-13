import { useState, useEffect } from 'react';
import { accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import { map } from 'rxjs/operators';
import { screenWidthPx } from '../utils/responsive';

export const useGyroscope = (enabled: boolean, initialX: number, playerWidth: number) => {
  const [playerX, setPlayerX] = useState(initialX);

  useEffect(() => {
    if (!enabled) return;

    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 16); // 60fps approx

      const subscription = accelerometer
        .pipe(
          map(({ x, y, z }) => {
            // Sensitivity factor - tilt device left/right (x axis in portrait)
            // x is positive when tilted left, negative when tilted right
            return -x * 12; 
          })
        )
        .subscribe(dx => {
          setPlayerX(currentX => {
            const nextX = currentX + dx;
            return Math.max(0, Math.min(screenWidthPx - playerWidth, nextX));
          });
        });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.warn('Accelerometer not available:', error);
    }
  }, [enabled, playerWidth]);

  return { playerX, setPlayerX };
};
