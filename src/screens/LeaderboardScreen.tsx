// === FILE: src/screens/LeaderboardScreen.tsx ===
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { firebaseManager } from '../utils/FirebaseManager';

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const globalScores = await firebaseManager.getLeaderboard();
        if (globalScores) {
          const scoresArray = globalScores
            .filter((item: any) => item && typeof item.level === 'number')
            .sort((a: any, b: any) => b.level - a.level);
          setScores(scoresArray);
        } else {
          setScores([]);
        }
      } catch (error) {
        console.warn('Error loading global scores:', error);
        setScores([]);
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

  const renderScoreItem = ({ item, index }: { item: any; index: number }) => {
    const rank = index + 1;
    
    return (
      <View style={[styles.scoreItem, item.isMe && styles.myScoreItem]}>
        <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) + '20' }]}>
          <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
            {getRankIcon(rank)}
          </Text>
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={[styles.scoreText, item.isMe && styles.myScoreText]}>
            {item.name || 'Anonymous'} {item.isMe ? '(YOU)' : ''}
          </Text>
          <Text style={styles.levelText}>REACHED LEVEL {item.level}</Text>
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
        <View style={styles.listContainer}>
          <FlatList
            data={scores}
            renderItem={renderScoreItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {/* User's own rank sticky footer */}
          <View style={styles.userRankFooter}>
            <Text style={styles.userRankTitle}>YOUR GLOBAL POSITION</Text>
            <View style={styles.userRankContent}>
              <Text style={styles.userRankLevel}>LEVEL {scores.find(s => s.isMe)?.level || '?'}</Text>
              <Text style={styles.userRankStatus}>RANKING UPDATES LIVE ⚡</Text>
            </View>
          </View>
        </View>
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
  myScoreItem: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderWidth: 2,
  },
  myScoreText: {
    color: COLORS.primary,
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
  listContainer: {
    flex: 1,
  },
  userRankFooter: {
    backgroundColor: '#1A1A2E',
    padding: wp(4),
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    alignItems: 'center',
  },
  userRankTitle: {
    color: COLORS.muted,
    fontSize: wp(3),
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: hp(1),
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  userRankLevel: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: '900',
  },
  userRankStatus: {
    color: COLORS.accent,
    fontSize: wp(3),
    fontWeight: '700',
  },
});
