import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Hide splash screen after 4 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, glowAnim, pulseAnim, onFinish]);

  return (
    <View style={styles.container}>
      {/* Splash Image with Effects */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ImageBackground 
          source={require('../assets/splash.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Subtle gradient overlay for depth */}
          <View style={styles.gradientOverlay} />
          
          {/* Loading indicator at bottom */}
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.1,
  },
  mainTitle: {
    fontSize: wp(18),
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: wp(14),
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: -10,
  },
  glowEffect: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.3,
    backgroundColor: COLORS.glowCyan,
    borderRadius: width * 0.4,
    opacity: 0.3,
    filter: 'blur(20px)',
  },
  tagline: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: hp(15),
    paddingHorizontal: wp(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: hp(10),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: wp(2),
    height: wp(2),
    backgroundColor: COLORS.accent,
    borderRadius: wp(1),
    marginHorizontal: wp(1.5),
  },
});

export default SplashScreen;
