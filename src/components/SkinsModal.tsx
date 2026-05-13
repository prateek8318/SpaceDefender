import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { SkinType } from '../types/game.types';
import { Player } from './Player';

interface SkinsModalProps {
  visible: boolean;
  onClose: () => void;
  bestScore: number;
  currentSkin: SkinType;
  onSelectSkin: (skin: SkinType) => void;
}

const SKINS_CONFIG: { type: SkinType; name: string; unlockLevel: number; color: string }[] = [
  { type: 'scout', name: 'BASIC SCOUT', unlockLevel: 0, color: '#ecf0f1' },
  { type: 'vanguard', name: 'NEON VANGUARD', unlockLevel: 10, color: '#3498db' },
  { type: 'phoenix', name: 'FIRE PHOENIX', unlockLevel: 20, color: '#e74c3c' },
  { type: 'phantom', name: 'PURPLE PHANTOM', unlockLevel: 30, color: '#9b59b6' },
  { type: 'omega', name: 'GOLDEN OMEGA', unlockLevel: 40, color: '#f1c40f' },
];

export const SkinsModal: React.FC<SkinsModalProps> = ({
  visible,
  onClose,
  bestScore,
  currentSkin,
  onSelectSkin,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>SELECT YOUR SHIP</Text>
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {SKINS_CONFIG.map((skin) => {
              const isUnlocked = bestScore >= skin.unlockLevel;
              const isSelected = currentSkin === skin.type;
              
              return (
                <TouchableOpacity
                  key={skin.type}
                  style={[
                    styles.skinCard,
                    isSelected && styles.selectedCard,
                    !isUnlocked && styles.lockedCard
                  ]}
                  onPress={() => isUnlocked && onSelectSkin(skin.type)}
                  disabled={!isUnlocked}
                >
                  <View style={styles.previewContainer}>
                    <Player 
                      x={0} 
                      y={0} 
                      width={wp(10)} 
                      height={wp(12)} 
                      skin={skin.type}
                    />
                  </View>
                  
                  <View style={styles.skinInfo}>
                    <Text style={[styles.skinName, { color: skin.color }]}>{skin.name}</Text>
                    {isUnlocked ? (
                      <Text style={styles.unlockedText}>{isSelected ? 'SELECTED' : 'UNLOCKED'}</Text>
                    ) : (
                      <Text style={styles.lockedText}>UNLOCK AT LEVEL {skin.unlockLevel}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#0a0a1e',
    width: wp(90),
    maxHeight: hp(80),
    borderRadius: wp(4),
    padding: wp(5),
    borderWidth: 2,
    borderColor: '#3498db',
  },
  title: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: hp(3),
    letterSpacing: 2,
  },
  scrollContent: {
    gap: hp(2),
  },
  skinCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedCard: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  lockedCard: {
    opacity: 0.5,
  },
  previewContainer: {
    width: wp(15),
    height: wp(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinInfo: {
    flex: 1,
    marginLeft: wp(4),
  },
  skinName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  unlockedText: {
    color: '#2ecc71',
    fontSize: wp(3),
    fontWeight: 'bold',
    marginTop: 2,
  },
  lockedText: {
    color: '#e74c3c',
    fontSize: wp(3),
    fontWeight: 'bold',
    marginTop: 2,
  },
  closeButton: {
    marginTop: hp(3),
    backgroundColor: '#3498db',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
});
