import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/splash.png')}
        style={[
          styles.splashImage,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000814',
  },
  splashImage: {
    width: width * 0.8,
    height: height * 0.6,
  },
});

export default SplashScreen;
