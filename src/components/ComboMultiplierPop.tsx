import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { wp } from '../utils/responsive';

interface ComboMultiplierPopProps {
  multiplier: number;
  onFinish: () => void;
}

export const ComboMultiplierPop: React.FC<ComboMultiplierPopProps> = ({ multiplier, onFinish }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.5),
      withSpring(1),
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 200 }, () => {
        runOnJS(onFinish)();
      })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 200 })
    );
  }, [multiplier]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getColor = () => {
    if (multiplier >= 8) return '#f1c40f';
    if (multiplier >= 4) return '#e67e22';
    return '#3498db';
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Text style={[styles.text, { color: getColor() }]}>
        x{multiplier}!
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  text: {
    fontSize: wp(18),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
    fontStyle: 'italic',
  },
});
