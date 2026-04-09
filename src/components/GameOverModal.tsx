// === FILE: src/components/GameOverModal.tsx ===
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  level: number;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  level,
  onRetry,
  onHome,
}) => {
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
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>RETRY</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(4),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(6),
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
  homeButton: {
    backgroundColor: COLORS.muted,
    paddingHorizontal: wp(6),
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
