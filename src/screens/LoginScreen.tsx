import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { firebaseManager } from '../utils/FirebaseManager';
import auth from '@react-native-firebase/auth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await auth().createUserWithEmailAndPassword(email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Auth Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await firebaseManager.signInAnonymously();
    } catch (error: any) {
      Alert.alert('Error', 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.titleGlow}>SPACE</Text>
          <Text style={styles.titleMain}>DEFENDER</Text>
          <Text style={styles.subtitle}>SECURE YOUR PROGRESS</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="EMAIL ADDRESS"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.mainButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsRegistering(!isRegistering)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isRegistering ? 'ALREADY HAVE AN ACCOUNT? LOGIN' : 'NEW PILOT? REGISTER HERE'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity 
          style={styles.guestButton}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>CONTINUE AS GUEST</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Guest progress is stored locally and may be lost on reinstall.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(8),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(6),
  },
  titleGlow: {
    color: 'rgba(52, 152, 219, 0.1)',
    fontSize: wp(10),
    fontWeight: '900',
    letterSpacing: 8,
    position: 'absolute',
    top: -5,
  },
  titleMain: {
    color: '#fff',
    fontSize: wp(10),
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: 'rgba(52, 152, 219, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    color: '#3498db',
    fontSize: wp(3),
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: hp(1),
  },
  form: {
    gap: hp(2),
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mainButton: {
    backgroundColor: '#3498db',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginTop: hp(2),
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '900',
    letterSpacing: 2,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: hp(1),
  },
  switchText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(2.8),
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(4),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orText: {
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: wp(4),
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: hp(1.8),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerNote: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: wp(2.5),
    textAlign: 'center',
    marginTop: hp(4),
    fontStyle: 'italic',
  },
});
