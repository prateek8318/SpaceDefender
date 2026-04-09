// === FILE: src/components/ExitConfirmationModal.tsx ===
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

interface ExitConfirmationModalProps {
  visible: boolean;
  onExit: () => void;
  onCancel: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  visible,
  onExit,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <View style={styles.exitIcon}>
              <Text style={styles.exitIconText}>?</Text>
            </View>
          </View>
          
          <Text style={styles.title}>Exit Game?</Text>
          <Text style={styles.subtitle}>Are you sure you want to exit Space Defender?</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exitButton} 
              onPress={onExit}
              activeOpacity={0.7}
            >
              <Text style={styles.exitButtonText}>EXIT</Text>
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
    minWidth: wp(85),
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  iconContainer: {
    marginBottom: hp(3),
  },
  exitIcon: {
    width: wp(16),
    height: wp(16),
    backgroundColor: COLORS.danger,
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIconText: {
    color: COLORS.white,
    fontSize: wp(8),
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.danger,
    fontSize: wp(7),
    fontWeight: 'bold',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.text,
    fontSize: wp(4),
    textAlign: 'center',
    marginBottom: hp(5),
    paddingHorizontal: wp(4),
    lineHeight: hp(2.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(4),
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.muted,
    paddingHorizontal: wp(6),
    paddingVertical: hp(2.5),
    borderRadius: wp(2),
    flex: 1,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exitButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: wp(6),
    paddingVertical: hp(2.5),
    borderRadius: wp(2),
    flex: 1,
  },
  exitButtonText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
