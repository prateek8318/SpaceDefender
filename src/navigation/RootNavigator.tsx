// === FILE: src/navigation/RootNavigator.tsx ===
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { COLORS } from '../utils/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { LevelSelectScreen } from '../screens/LevelSelectScreen';
import { GameScreen } from '../screens/GameScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050510', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.bg },
          cardOverlayEnabled: true,
          gestureEnabled: true,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 250 } },
            close: { animation: 'timing', config: { duration: 200 } },
          },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
