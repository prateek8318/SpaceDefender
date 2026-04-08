// === FILE: src/screens/LevelSelectScreen.tsx ===
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { getUnlockedLevel, saveUnlockedLevel } from '../utils/storage';
import { LEVELS } from '../utils/levelConfig';

export const LevelSelectScreen: React.FC = () => {
  const navigation = useNavigation();
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

  useEffect(() => {
    const loadUnlockedLevel = async () => {
      try {
        const level = await getUnlockedLevel();
        setUnlockedLevel(level);
      } catch (error) {
        console.error('Error loading unlocked level:', error);
      }
    };

    loadUnlockedLevel();
  }, []);

  const handleLevelSelect = async (levelId: number) => {
    if (levelId <= unlockedLevel) {
      navigation.navigate('Game' as never, { levelId } as never);
    }
  };

  const renderLevelCard = (level: typeof LEVELS[0]) => {
    const isUnlocked = level.id <= unlockedLevel;
    const isBossLevel = level.id % 5 === 0;

    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelCard,
          !isUnlocked && styles.lockedCard,
          isBossLevel && styles.bossCard,
        ]}
        onPress={() => handleLevelSelect(level.id)}
        disabled={!isUnlocked}
      >
        <View style={styles.cardContent}>
          {!isUnlocked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <>
              <Text style={styles.levelNumber}>{level.id}</Text>
              <Text style={styles.levelLabel}>LEVEL</Text>
              {isBossLevel && <Text style={styles.bossLabel}>BOSS</Text>}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SELECT LEVEL</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.levelGrid} contentContainerStyle={styles.gridContent}>
        <View style={styles.row}>
          {LEVELS.slice(0, 2).map(renderLevelCard)}
        </View>
        <View style={styles.row}>
          {LEVELS.slice(2, 4).map(renderLevelCard)}
        </View>
        <View style={styles.row}>
          {LEVELS.slice(4, 6).map(renderLevelCard)}
        </View>
        <View style={styles.row}>
          {LEVELS.slice(6, 8).map(renderLevelCard)}
        </View>
        <View style={styles.row}>
          {LEVELS.slice(8, 10).map(renderLevelCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: 'rgba(93, 202, 165, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  backButton: {
    padding: wp(2),
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  placeholder: {
    width: wp(12),
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
    marginBottom: hp(3),
  },
  levelCard: {
    width: wp(42),
    height: hp(20),
    backgroundColor: COLORS.primary,
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  lockedCard: {
    backgroundColor: COLORS.muted,
    borderColor: COLORS.muted,
  },
  bossCard: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.purple,
  },
  cardContent: {
    alignItems: 'center',
  },
  levelNumber: {
    color: COLORS.bg,
    fontSize: wp(8),
    fontWeight: 'bold',
  },
  levelLabel: {
    color: COLORS.bg,
    fontSize: wp(3),
    marginTop: hp(0.5),
  },
  bossLabel: {
    color: COLORS.accent,
    fontSize: wp(2.5),
    fontWeight: 'bold',
    marginTop: hp(0.5),
  },
  lockIcon: {
    fontSize: wp(6),
  },
});
