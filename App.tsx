import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <View style={styles.container}>
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <RootNavigator />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
