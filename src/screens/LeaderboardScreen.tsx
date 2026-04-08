// === FILE: src/screens/LeaderboardScreen.tsx ===
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { getLeaderboard, ScoreEntry } from '../utils/storage';

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const leaderboardScores = await getLeaderboard();
        setScores(leaderboardScores);
      } catch (error) {
        console.error('Error loading scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return COLORS.accent;
      case 2:
        return COLORS.muted;
      case 3:
        return COLORS.purple;
      default:
        return COLORS.text;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderScoreItem = ({ item, index }: { item: ScoreEntry; index: number }) => {
    const rank = index + 1;
    
    return (
      <View style={styles.scoreItem}>
        <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) + '20' }]}>
          <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
            {getRankIcon(rank)}
          </Text>
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreText}>{item.score.toLocaleString()}</Text>
          <Text style={styles.levelText}>Level {item.level}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>NO SCORES YET</Text>
      <Text style={styles.emptyStateText}>Be the first to set a high score!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LEADERBOARD</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      ) : scores.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScoreItem}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: wp(4),
  },
  listContent: {
    padding: wp(4),
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 136, 187, 0.1)',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  rankContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  rankText: {
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  scoreText: {
    color: COLORS.accent,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  levelText: {
    color: COLORS.muted,
    fontSize: wp(3),
    marginTop: hp(0.5),
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: COLORS.text,
    fontSize: wp(3),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  emptyStateTitle: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: 'bold',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: wp(4),
    textAlign: 'center',
  },
});
