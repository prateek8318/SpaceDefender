// === FILE: src/components/GameOverModal.tsx ===
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, Share } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { adManager } from '../utils/AdManager';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  level: number;
  onRetry: () => void;
  onHome: () => void;
  onRevive: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  level,
  onRetry,
  onHome,
  onRevive,
}) => {
  const handleRevive = () => {
    const started = adManager.showRewardedAd((earnedReward) => {
      if (earnedReward) {
        onRevive();
      }
    });

    if (!started) {
      Alert.alert(
        'Ad Not Ready',
        'Please wait a few seconds for the transmission to clear and try again!',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>GAME OVER</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Final Score</Text>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Level Reached</Text>
              <Text style={styles.statValue}>{level}</Text>
            </View>
          </View>
          
          {/* <TouchableOpacity 
            style={styles.reviveButton} 
            onPress={handleRevive}
            activeOpacity={0.7}
          >
            <Text style={styles.reviveButtonText}>📺 WATCH AD TO REVIVE</Text>
          </TouchableOpacity> */}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>RETRY</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={() => {
                Share.share({
                  message: `I scored ${score.toLocaleString()} on Level ${level} in Space Defender! Can you beat me?`,
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.shareButtonText}>SHARE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.homeButton} 
              onPress={onHome}
              activeOpacity={0.7}
            >
              <Text style={styles.homeButtonText}>HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.bg,
    padding: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    minWidth: wp(80),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    color: COLORS.danger,
    fontSize: wp(8),
    fontWeight: 'bold',
    marginBottom: hp(4),
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    marginBottom: hp(4),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.muted,
  },
  statLabel: {
    color: COLORS.text,
    fontSize: wp(4),
  },
  statValue: {
    color: COLORS.accent,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  reviveButton: {
    backgroundColor: COLORS.secondary,
    width: '100%',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#fff',
  },
  reviveButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(4),
    width: '100%',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: wp(2),
    flex: 1,
  },
  retryButtonText: {
    color: COLORS.bg,
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#3498db',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    flex: 1,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: COLORS.muted,
    paddingVertical: hp(2),
    borderRadius: wp(2),
    flex: 1,
  },
  homeButtonText: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
