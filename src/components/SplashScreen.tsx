import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const videoSource = Platform.select({
    android: { uri: 'splash' },
    ios: require('../assets/videos/splash.mp4'),
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        source={videoSource}
        style={styles.video}
        resizeMode="cover"
        repeat={false}
        onLoad={() => console.log('[SplashScreen] Video loaded')}
        onBuffer={({ isBuffering }) => console.log('[SplashScreen] Buffering:', isBuffering)}
        onEnd={() => {
          console.log('[SplashScreen] Video ended');
          onFinish();
        }}
        onError={(e) => {
          console.warn('[SplashScreen] Video error:', e);
          onFinish(); // Proceed to game anyway
        }}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
  },
});

export default SplashScreen;
