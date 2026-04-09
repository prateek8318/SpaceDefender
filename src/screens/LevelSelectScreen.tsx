// === FILE: src/screens/LevelSelectScreen.tsx ===
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { getUnlockedLevel, saveUnlockedLevel } from '../utils/storage';
import { LEVELS } from '../utils/levelConfig';

export const LevelSelectScreen: React.FC = () => {
  const navigation = useNavigation();
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUnlockedLevel = async () => {
      try {
        const level = await getUnlockedLevel();
        console.log('LevelSelectScreen - Loaded unlocked level:', level);
        setUnlockedLevel(level);
        // Start animations after data loads
        startAnimations();
      } catch (error) {
        console.error('Error loading unlocked level:', error);
      }
    };

    loadUnlockedLevel();
  }, []);

  // Entrance animations
  const startAnimations = () => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Cards staggered animation
    cardsAnim.setValue(0);
    setTimeout(() => {
      cardsAnim.setValue(1);
    }, 400);

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startAnimations();
  }, []);

  // Refresh unlocked levels when screen becomes focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const loadUnlockedLevel = async () => {
        try {
          const level = await getUnlockedLevel();
          console.log('LevelSelectScreen - Refreshed unlocked level:', level);
          setUnlockedLevel(level);
        } catch (error) {
          console.error('Error refreshing unlocked level:', error);
        }
      };

      loadUnlockedLevel();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLevelSelect = async (levelId: number) => {
    if (levelId <= unlockedLevel) {
      navigation.navigate('Game' as never, { levelId } as never);
    }
  };

  const renderLevelCard = (level: typeof LEVELS[0], index: number) => {
    const isUnlocked = level.id <= unlockedLevel;
    const isBossLevel = level.id % 5 === 0;
    const isCurrentLevel = level.id === unlockedLevel;

    const cardAnim = useRef(new Animated.Value(0)).current;
    
    // Start card animation immediately
    setTimeout(() => {
      cardAnim.setValue(1);
    }, index * 100);

    return (
      <Animated.View
        key={level.id}
        style={[
          styles.cardWrapper,
          {
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })},
              { scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })},
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.levelCard,
            !isUnlocked && styles.lockedCard,
            isBossLevel && styles.bossCard,
            isCurrentLevel && styles.currentLevelCard,
          ]}
          onPress={() => handleLevelSelect(level.id)}
          disabled={!isUnlocked}
          activeOpacity={isUnlocked ? 0.8 : 1}
        >
          
          {/* Card content */}
          <View style={styles.cardContent}>
            {!isUnlocked ? (
              <View style={styles.lockedContent}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockedText}>LOCKED</Text>
              </View>
            ) : (
              <>
                <View style={styles.levelNumberContainer}>
                  <Text style={styles.levelNumber}>{level.id}</Text>
                  {isCurrentLevel && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.levelLabel}>LEVEL</Text>
                {isBossLevel && (
                  <View style={styles.bossBadge}>
                    <Text style={styles.bossLabel}>BOSS</Text>
                  </View>
                )}
                
                {/* Difficulty stars */}
                <View style={styles.difficultyStars}>
                  {Array.from({ length: Math.ceil(level.id / 3) }, (_, i) => (
                    <Text key={i} style={styles.starIcon}>⭐</Text>
                  ))}
                </View>
              </>
            )}
          </View>
          
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header with animation */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              { translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              })},
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backButtonText}>←</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0.4, 1],
                  outputRange: [0.6, 1],
                }),
              },
            ]}
          >
            SELECT LEVEL
          </Animated.Text>
          <Text style={styles.subtitle}>Choose your mission</Text>
        </View>
        
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Level grid with animation */}
      <Animated.View
        style={[
          styles.levelGridWrapper,
          {
            opacity: cardsAnim,
            transform: [
              { translateY: cardsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })},
            ],
          },
        ]}
      >
        <ScrollView 
          style={styles.levelGrid} 
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: Math.ceil(LEVELS.length / 2) }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {LEVELS.slice(rowIndex * 2, (rowIndex + 1) * 2).map((level, index) => 
                renderLevelCard(level, rowIndex * 2 + index)
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Progress indicator */}
      <View style={styles.progressIndicator}>
        <Text style={styles.progressText}>
          {unlockedLevel} of {LEVELS.length} Levels Unlocked
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(unlockedLevel / LEVELS.length) * 100}%` }
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
    backgroundColor: 'rgba(93, 202, 165, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93, 202, 165, 0.2)',
    zIndex: 10,
  },
  backButton: {
    padding: wp(2),
  },
  backButtonInner: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: wp(3.5),
    textAlign: 'center',
    marginTop: hp(0.5),
    letterSpacing: 0.5,
  },
  placeholder: {
    width: wp(12),
  },
  levelGridWrapper: {
    flex: 1,
  },
  levelGrid: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  gridContent: {
    paddingVertical: hp(4),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(4),
  },
  cardWrapper: {
    width: wp(42),
  },
  levelCard: {
    height: hp(20),
    backgroundColor: 'rgba(93, 202, 165, 0.1)',
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: wp(6),
    opacity: 0.2,
    filter: 'blur(25px)',
  },
  cardBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: wp(6),
    borderWidth: 1,
  },
  lockedCard: {
    backgroundColor: 'rgba(136, 136, 187, 0.1)',
    borderColor: COLORS.muted,
  },
  bossCard: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  currentLevelCard: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  cardContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  levelNumberContainer: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  levelNumber: {
    color: COLORS.primary,
    fontSize: wp(10),
    fontWeight: '900',
  },
  levelLabel: {
    color: COLORS.text,
    fontSize: wp(3.5),
    fontWeight: '600',
    marginBottom: hp(1),
    letterSpacing: 1,
  },
  bossBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    marginTop: hp(1),
  },
  bossLabel: {
    color: COLORS.white,
    fontSize: wp(2.5),
    fontWeight: '900',
    letterSpacing: 1,
  },
  currentBadge: {
    position: 'absolute',
    top: -hp(2),
    right: -wp(4),
    backgroundColor: COLORS.accent,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1.5),
  },
  currentBadgeText: {
    color: COLORS.bgDark,
    fontSize: wp(2),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  difficultyStars: {
    flexDirection: 'row',
    marginTop: hp(1),
  },
  starIcon: {
    fontSize: wp(3),
    marginHorizontal: wp(0.5),
  },
  lockedContent: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: wp(8),
    marginBottom: hp(1),
  },
  lockedText: {
    color: COLORS.muted,
    fontSize: wp(3),
    fontWeight: '600',
    letterSpacing: 1,
  },
  progressIndicator: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    backgroundColor: 'rgba(93, 202, 165, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(93, 202, 165, 0.2)',
  },
  progressText: {
    color: COLORS.muted,
    fontSize: wp(3.5),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  progressBar: {
    height: hp(1),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: hp(0.5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: hp(0.5),
  },
});
