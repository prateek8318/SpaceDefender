import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { hp, screenHeightPx, screenWidthPx, wp } from '../utils/responsive';
import { useHighScore } from '../hooks/useHighScore';
import { ExitConfirmationModal } from '../components/ExitConfirmationModal';
import { soundManager } from '../utils/SoundManager';
import { firebaseManager } from '../utils/FirebaseManager';
import { SkinsModal } from '../components/SkinsModal';
import { getSelectedSkin, saveSelectedSkin, getUnlockedLevel, getVolumeSettings, getGyroEnabled } from '../utils/storage';
import { SettingsModal } from '../components/SettingsModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { SkinType } from '../types/game.types';
import { getCoins } from '../utils/storage';
import { Player } from '../components/Player';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { bestScore, loading } = useHighScore();
  
  const [stars, setStars] = useState<Star[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSkinsModal, setShowSkinsModal] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [currentSkin, setCurrentSkin] = useState<SkinType>('scout');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [coins, setCoins] = useState(0);

  // Reanimated Shared Values
  const shipOffset = useSharedValue(0);
  const playButtonScale = useSharedValue(1);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    const loadData = async () => {
      const savedSkin = await getSelectedSkin();
      setCurrentSkin(savedSkin as SkinType);
      
      const level = await getUnlockedLevel();
      setUnlockedLevel(level);
      setSoundEnabled(soundManager.isSoundEnabled());

      // Load volumes and gyro settings
      const volumes = await getVolumeSettings();
      soundManager.setMusicVolume(volumes.music);
      soundManager.setEffectVolume(volumes.effect);
      soundManager.setBulletVolume(volumes.bullet);

      if (soundManager.isSoundEnabled()) {
        soundManager.playBackgroundMusic();
      }

      const c = await getCoins();
      setCoins(c);
    };
    loadData();

    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // Animations
    shipOffset.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    playButtonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    titleOpacity.value = withTiming(1, { duration: 1500 });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: 30 }, (_, index) => ({
      id: `bg-star-${index}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setStars(initialStars);

    const backAction = () => {
      if (navigation.isFocused()) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const animatedShipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shipOffset.value }],
  }));

  const animatedPlayButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const handleSelectSkin = async (skin: SkinType) => {
    setCurrentSkin(skin);
    await saveSelectedSkin(skin);
    setShowSkinsModal(false);
  };

  const handlePlay = () => {
    navigation.navigate('LevelSelect' as never);
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard' as never);
  };

  const handleShare = async () => {
    try {
      const referralCode = await firebaseManager.getReferralCode();
      const message = `🚀 Join me in Space Defender! \n\nUse my referral code: ${referralCode}\n\nDownload now: https://play.google.com/store/apps/details?id=com.spacedefender.newgame`;
      await Share.share({ message, title: 'Space Defender Referral' });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleExit = () => {
    soundManager.stopBackgroundMusic();
    soundManager.stopAllEffects();
    setShowExitModal(false);
    setTimeout(() => BackHandler.exitApp(), 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.nebulaTop} />
      <View style={styles.nebulaBottom} />
      
      {stars.map((star, i) => (
        <View
          key={`star-${i}`}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>BEST MISSION</Text>
            <Text style={styles.scoreValue}>{unlockedLevel}</Text>
          </View>

          <View style={[styles.scoreBadge, { borderColor: COLORS.accent }]}>
            <Text style={[styles.scoreLabel, { color: COLORS.accent }]}>HIGH SCORE</Text>
            <Text style={[styles.scoreValue, { color: COLORS.accent }]}>{loading ? '...' : bestScore.toLocaleString()}</Text>
          </View>

          <View style={[styles.scoreBadge, { borderColor: '#f1c40f' }]}>
            <Text style={[styles.scoreLabel, { color: '#f1c40f' }]}>COINS</Text>
            <Text style={[styles.scoreValue, { color: '#f1c40f' }]}>💰 {coins}</Text>
          </View>
          
          <View style={styles.rightHeader}>
            <TouchableOpacity 
              style={[styles.soundIconContainer, soundEnabled ? styles.soundIconOn : styles.soundIconOff]} 
              onPress={() => {
                const newSoundEnabled = !soundEnabled;
                setSoundEnabled(newSoundEnabled);
                soundManager.setSoundEnabled(newSoundEnabled);
              }}
            >
              <Text style={styles.soundEmoji}>{soundEnabled ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.soundIconContainer, { marginTop: hp(1) }]} 
              onPress={() => setShowSettingsModal(true)}
            >
              <Text style={styles.soundEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.shipPreviewContainer}>
          <View style={styles.shipPlatform}>
            <View style={styles.platformGlow} />
          </View>
          <Animated.View style={[styles.floatingShip, animatedShipStyle]}>
            <Player 
              x={0} 
              y={0} 
              width={wp(20)} 
              height={wp(24)} 
              skin={currentSkin}
            />
          </Animated.View>
          <TouchableOpacity 
            style={styles.changeSkinTag}
            onPress={() => setShowSkinsModal(true)}
          >
            <Text style={styles.changeSkinText}>UPGRADE SHIP ⚡</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.titleArea, animatedTitleStyle]}>
          <Text style={styles.titleGlow}>SPACE</Text>
          <Text style={styles.titleMain}>DEFENDER</Text>
          <Text style={styles.titleTagline}>GALACTIC GUARDIAN PROTOCOL</Text>
        </Animated.View>

        <View style={styles.bottomArea}>
          <View style={{ gap: hp(1.5) }}>
            <Animated.View style={animatedPlayButtonStyle}>
              <TouchableOpacity 
                style={styles.mainPlayButton} 
                onPress={handlePlay}
                activeOpacity={0.8}
              >
                <Text style={styles.playText}>START MISSION</Text>
                <View style={styles.playButtonGlow} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.circleButton} onPress={() => setShowUpgradeModal(true)}>
              <Text style={styles.circleIcon}>🛠️</Text>
              <Text style={styles.circleLabel}>UPGRADES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleButton} onPress={() => setShowSkinsModal(true)}>
              <Text style={styles.circleIcon}>🚀</Text>
              <Text style={styles.circleLabel}>SKINS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleButton} onPress={handleLeaderboard}>
              <Text style={styles.circleIcon}>🏆</Text>
              <Text style={styles.circleLabel}>RANKS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleButton} onPress={handleShare}>
              <Text style={styles.circleIcon}>🔗</Text>
              <Text style={styles.circleLabel}>SHARE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <UpgradeModal 
          visible={showUpgradeModal}
          onClose={async () => {
            setShowUpgradeModal(false);
            const c = await getCoins();
            setCoins(c);
          }}
        />

        <SkinsModal 
          visible={showSkinsModal}
          onClose={() => setShowSkinsModal(false)}
          bestScore={unlockedLevel}
          currentSkin={currentSkin}
          onSelectSkin={handleSelectSkin}
        />

        <ExitConfirmationModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onExit={handleExit}
        />

        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  nebulaTop: {
    position: 'absolute',
    top: -hp(10),
    right: -wp(20),
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
  },
  nebulaBottom: {
    position: 'absolute',
    bottom: -hp(10),
    left: -wp(20),
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'space-between',
    paddingVertical: hp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: wp(2.5),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '900',
  },
  soundIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  soundIconOn: { borderColor: '#2ecc71' },
  soundIconOff: { borderColor: '#e74c3c' },
  soundEmoji: { fontSize: wp(6) },
  rightHeader: {
    alignItems: 'center',
  },
  
  shipPreviewContainer: {
    height: hp(30),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: hp(2),
  },
  shipPlatform: {
    position: 'absolute',
    bottom: hp(2),
    width: wp(40),
    height: hp(1.5),
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    borderRadius: wp(10),
    transform: [{ scaleX: 2 }],
  },
  platformGlow: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    borderRadius: wp(10),
    shadowColor: '#3498db',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  floatingShip: {
    marginBottom: hp(2),
  },
  changeSkinTag: {
    position: 'absolute',
    bottom: -hp(1),
    backgroundColor: 'rgba(52, 152, 219, 0.25)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#3498db',
  },
  changeSkinText: {
    color: '#3498db',
    fontSize: wp(3),
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  titleArea: {
    alignItems: 'center',
    marginVertical: hp(1),
  },
  titleGlow: {
    color: 'rgba(52, 152, 219, 0.1)',
    fontSize: wp(13),
    fontWeight: '900',
    letterSpacing: 12,
    position: 'absolute',
    top: -10,
  },
  titleMain: {
    color: '#fff',
    fontSize: wp(13),
    fontWeight: '900',
    letterSpacing: 12,
    textShadowColor: 'rgba(52, 152, 219, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleTagline: {
    color: '#3498db',
    fontSize: wp(2.8),
    fontWeight: 'bold',
    letterSpacing: 5,
    marginTop: hp(0.5),
    opacity: 0.8,
  },

  bottomArea: {
    width: '100%',
    gap: hp(5),
    marginBottom: hp(2),
  },
  mainPlayButton: {
    backgroundColor: '#3498db',
    paddingVertical: hp(2.5),
    borderRadius: wp(4),
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  playText: {
    color: '#fff',
    fontSize: wp(6.5),
    fontWeight: '900',
    letterSpacing: 4,
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
  },
  circleButton: {
    alignItems: 'center',
    gap: hp(1),
  },
  circleIcon: {
    fontSize: wp(7.5),
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(255,255,255,0.06)',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: wp(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
  },
  circleLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: wp(2.8),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
