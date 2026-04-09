import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { hp, wp } from '../utils/responsive';
import { getUnlockedLevel } from '../utils/storage';
import { LEVELS } from '../utils/levelConfig';

const LEVEL_PREVIEW_COUNT = 120;

export const LevelSelectScreen: React.FC = () => {
  const navigation = useNavigation();
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  const visibleLevels = useMemo(
    () => LEVELS.slice(0, Math.max(LEVEL_PREVIEW_COUNT, unlockedLevel + 10)),
    [unlockedLevel],
  );

  useEffect(() => {
    const loadUnlockedLevel = async () => {
      const level = await getUnlockedLevel();
      setUnlockedLevel(level);
    };

    loadUnlockedLevel();

    const unsubscribe = navigation.addListener('focus', loadUnlockedLevel);
    return unsubscribe;
  }, [navigation]);

  const handleLevelSelect = useCallback(
    (levelId: number) => {
      if (levelId <= unlockedLevel) {
        (navigation as any).navigate('Game', { levelId });
      }
    },
    [navigation, unlockedLevel],
  );

  const renderLevelCard = useCallback(
    ({ item }: { item: (typeof LEVELS)[number] }) => {
      const isUnlocked = item.id <= unlockedLevel;
      const isBossLevel = item.id % 5 === 0;
      const isCurrentLevel = item.id === unlockedLevel;
      const difficulty = Math.min(5, Math.max(1, Math.ceil(item.id / 4)));

      return (
        <TouchableOpacity
          style={[
            styles.levelCard,
            !isUnlocked && styles.lockedCard,
            isBossLevel && styles.bossCard,
            isCurrentLevel && styles.currentLevelCard,
          ]}
          onPress={() => handleLevelSelect(item.id)}
          disabled={!isUnlocked}
          activeOpacity={isUnlocked ? 0.85 : 1}
        >
          {!isUnlocked ? (
            <>
              <Text style={styles.lockIcon}>LOCKED</Text>
              <Text style={styles.lockedText}>Unlock previous level</Text>
            </>
          ) : (
            <>
              <Text style={styles.levelNumber}>{item.id}</Text>
              <Text style={styles.levelLabel}>LEVEL</Text>
              {isBossLevel && <Text style={styles.bossLabel}>BOSS ROUND</Text>}
              <Text style={styles.difficultyText}>DIFFICULTY {difficulty}/5</Text>
              {isCurrentLevel && <Text style={styles.currentBadge}>CURRENT</Text>}
            </>
          )}
        </TouchableOpacity>
      );
    },
    [handleLevelSelect, unlockedLevel],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>SELECT LEVEL</Text>
          <Text style={styles.subtitle}>Every level gets harder</Text>
        </View>

        <View style={styles.backButtonPlaceholder} />
      </View>

      <FlatList
        data={visibleLevels}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        renderItem={renderLevelCard}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.progressIndicator}>
        <Text style={styles.progressText}>
          Unlocked: {unlockedLevel} / {LEVELS.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(unlockedLevel / LEVELS.length) * 100}%` }]} />
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
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    minWidth: wp(16),
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: '700',
  },
  backButtonPlaceholder: {
    minWidth: wp(16),
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: wp(3.4),
    marginTop: hp(0.4),
  },
  gridContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
    gap: hp(2),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  levelCard: {
    width: wp(43),
    minHeight: hp(18),
    borderRadius: wp(4),
    backgroundColor: 'rgba(93, 202, 165, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(93, 202, 165, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  lockedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bossCard: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
  },
  currentLevelCard: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  levelNumber: {
    color: COLORS.primary,
    fontSize: wp(10),
    fontWeight: '900',
  },
  levelLabel: {
    color: COLORS.text,
    fontSize: wp(3.4),
    fontWeight: '700',
    letterSpacing: 1,
  },
  bossLabel: {
    marginTop: hp(1),
    color: COLORS.danger,
    fontSize: wp(3.2),
    fontWeight: '800',
  },
  difficultyText: {
    marginTop: hp(1),
    color: COLORS.accent,
    fontSize: wp(4.2),
    fontWeight: '700',
  },
  currentBadge: {
    marginTop: hp(1),
    color: COLORS.bgDark,
    backgroundColor: COLORS.accent,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2),
    overflow: 'hidden',
    fontSize: wp(2.8),
    fontWeight: '800',
  },
  lockIcon: {
    color: COLORS.text,
    fontSize: wp(4.2),
    fontWeight: '800',
  },
  lockedText: {
    marginTop: hp(1),
    color: COLORS.muted,
    fontSize: wp(3),
    textAlign: 'center',
  },
  progressIndicator: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressText: {
    color: COLORS.muted,
    fontSize: wp(3.4),
    textAlign: 'center',
    marginBottom: hp(1),
  },
  progressBar: {
    height: hp(1),
    borderRadius: hp(0.5),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});
