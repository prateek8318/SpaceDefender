// === FILE: src/screens/LeaderboardScreen.tsx ===
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { firebaseManager } from '../utils/FirebaseManager';
import { RefreshControl } from 'react-native';

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [scores, setScores] = useState<any[]>([]);
  const [myScore, setMyScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const globalScores = await firebaseManager.getLeaderboard(50);
        setScores(globalScores || []);
        
        // Fetch current user's entry specifically
        const userEntry = globalScores.find(s => s.isMe);
        if (userEntry) {
          setMyScore(userEntry);
        } else {
          const personal = await firebaseManager.getUserLeaderboardEntry();
          setMyScore(personal);
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

  const onRefresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const globalScores = await firebaseManager.getLeaderboard(50);
      setScores(globalScores || []);
      const userEntry = globalScores.find(s => s.isMe);
      if (userEntry) {
        setMyScore(userEntry);
      } else {
        const personal = await firebaseManager.getUserLeaderboardEntry();
        setMyScore(personal);
      }
    } catch (error) {
      console.warn('Error refreshing scores:', error);
    } finally {
      setLoading(false);
    }
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
          <Text style={[styles.nameText, item.isMe && styles.myNameText]}>
            {item.name || 'Anonymous'} {item.isMe ? '(YOU)' : ''}
          </Text>
          <Text style={styles.levelText}>MAX MISSION {item.level || 1}</Text>
        </View>

        <View style={styles.scoreValueContainer}>
          <Text style={styles.scoreValueText}>{(item.score || 0).toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>PTS</Text>
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
            keyExtractor={(item, index) => `${item.id || index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
          
          {/* User's own rank sticky footer */}
          <View style={styles.userRankFooter}>
            <Text style={styles.userRankTitle}>YOUR HIGHEST RECOGNITION</Text>
            <View style={styles.userRankContent}>
              <View>
                <Text style={styles.userRankScore}>{(myScore?.score || 0).toLocaleString()}</Text>
                <Text style={styles.userRankSub}>{myScore ? `MISSION ${myScore.level || 1} REACHED` : 'NO RECORD YET'}</Text>
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.userRankStatus}>LIVE UPDATES</Text>
              </View>
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
  nameText: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: '700',
  },
  myNameText: {
    color: COLORS.primary,
  },
  levelText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: wp(2.8),
    marginTop: hp(0.3),
    fontWeight: 'bold',
  },
  scoreValueContainer: {
    alignItems: 'flex-end',
  },
  scoreValueText: {
    color: COLORS.accent,
    fontSize: wp(5.5),
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  pointsLabel: {
    color: 'rgba(241, 196, 15, 0.5)',
    fontSize: wp(2.2),
    fontWeight: 'bold',
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
  userRankScore: {
    color: COLORS.accent,
    fontSize: wp(7),
    fontWeight: '900',
  },
  userRankSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ecc71',
    marginRight: 6,
  },
  userRankStatus: {
    color: '#2ecc71',
    fontSize: wp(2.5),
    fontWeight: '900',
  },
});
