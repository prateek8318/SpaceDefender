import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

export interface GlobalAudioHandle {
  playEffect: (key: string, volume?: number) => void;
  stopEffect: (key: string) => void;
  stopAllEffects: () => void;
  playBackground: (key: string, loop: boolean) => void;
  stopBackground: () => void;
  setMusicVolume: (volume: number) => void;
}

const SOUND_FILES: Record<string, any> = {
  spaceTheme: require('../assets/sounds/background/space\ theme.mp3'),
  shoot: require('../assets/sounds/effects/Shooting\ sound\ effects.mp3'),
  explosion: require('../assets/sounds/effects/explosion.mp3'),
  gameOver: require('../assets/sounds/effects/Game\ over.mp3'),
  powerUp: require('../assets/sounds/effects/Power-up\ sounds.mp3'),
  levelUp: require('../assets/sounds/effects/levelup.mp3'),
  bomb: require('../assets/sounds/effects/bomb.wav'),
};

export const GlobalAudio = forwardRef<GlobalAudioHandle>((props, ref) => {
  const [bgMusic, setBgMusic] = useState<{ key: string; loop: boolean } | null>(null);
  const [effects, setEffects] = useState<{ id: string | number; key: string; volume: number }[]>([]);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const lastPlayedRef = useRef<Record<string, number>>({});

  useImperativeHandle(ref, () => ({
    playEffect: (key: string, volume = 0.5) => {
      const now = Date.now();
      
      // Throttle frequent sounds to prevent audio flood
      const throttleTime = (key === 'shoot' || key === 'explosion') ? 100 : 50;
      if (lastPlayedRef.current[key] && now - lastPlayedRef.current[key] < throttleTime) {
        return;
      }
      lastPlayedRef.current[key] = now;

      const id = Math.random().toString(36).substring(7) + now;
      setEffects(prev => {
        // Concurrency limits per sound type
        const currentCountOfKey = prev.filter(e => e.key === key).length;
        if (key === 'shoot' && currentCountOfKey >= 4) return prev;
        if (key === 'explosion' && currentCountOfKey >= 3) return prev;
        if (key === 'bomb' && currentCountOfKey >= 2) return prev;

        const next = [...prev, { id, key, volume }];
        if (next.length > 8) {
          return next.slice(-8);
        }
        return next;
      });
    },
    stopEffect: (key: string) => {
      setEffects(prev => prev.filter(e => e.key !== key));
    },
    stopAllEffects: () => {
      setEffects([]);
    },
    playBackground: (key: string, loop: boolean) => {
      setBgMusic({ key, loop });
    },
    stopBackground: () => {
      setBgMusic(null);
    },
    setMusicVolume: (volume: number) => {
      setMusicVolume(volume);
    }
  }));

  const removeEffect = (id: string | number) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  return (
    <View style={styles.hidden}>
      {bgMusic && (
        <Video
          key="background-music"
          source={SOUND_FILES[bgMusic.key]}
          repeat={bgMusic.loop}
          paused={false}
          volume={musicVolume}
          playInBackground={true}
          ignoreSilentSwitch="ignore"
        />
      )}
      {effects.map(effect => (
        <Video
          key={effect.id}
          source={SOUND_FILES[effect.key]}
          repeat={false}
          paused={false}
          volume={effect.volume}
          onEnd={() => removeEffect(effect.id)}
          playInBackground={true}
          ignoreSilentSwitch="ignore"
          progressUpdateInterval={1000} // Reduce bridge traffic
          automaticallyWaitsToMinimizeStall={false} // Low latency
          bufferConfig={{
            minBufferMs: 100,
            maxBufferMs: 200,
            bufferForPlaybackMs: 50,
            bufferForPlaybackAfterRebufferMs: 100,
          }}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    position: 'absolute',
  }
});
