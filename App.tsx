import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';
import { GlobalAudio, GlobalAudioHandle } from './src/components/GlobalAudio';
import { soundManager } from './src/utils/SoundManager';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The app encountered an unexpected error. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

import { initStorage } from './src/utils/storage';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const audioRef = useRef<GlobalAudioHandle>(null);

  useEffect(() => {
    // Initialize storage first
    initStorage();
    
    if (audioRef.current) {
      soundManager.setAudioRef(audioRef.current);
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        soundManager.stopBackgroundMusic();
        soundManager.stopAllEffects();
      } else if (nextAppState === 'active') {
        if (soundManager.isSoundEnabled()) {
          soundManager.playBackgroundMusic();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [audioRef.current]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <RootNavigator />
        )}
        <GlobalAudio ref={audioRef} />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1e',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0a0a1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
