import React, { useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated,
} from 'react-native';
import { Weapon, WeaponType } from '../types/game.types';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

const WEAPONS: Weapon[] = [
  { id: 'standard', name: 'Standard Blaster', description: 'Balanced fire rate and damage', icon: '🔫', damageMult: 1, fireRateMult: 1 },
  { id: 'laser', name: 'Phase Laser', description: 'Continuous rapid beam, short range', icon: '🔦', damageMult: 0.6, fireRateMult: 2.5 },
  { id: 'shotgun', name: 'Flak Cannon', description: '5-bullet spread, massive close damage', icon: '🐚', damageMult: 1.2, fireRateMult: 0.6 },
  { id: 'sniper', name: 'Rail Gun', description: 'Piercing shot, extreme damage', icon: '🔭', damageMult: 5, fireRateMult: 0.3 },
];

interface WeaponSelectionModalProps {
  visible: boolean;
  currentWeapon: WeaponType;
  onSelect: (weapon: WeaponType) => void;
  onClose: () => void;
}

export const WeaponSelectionModal: React.FC<WeaponSelectionModalProps> = ({
  visible,
  currentWeapon,
  onSelect,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>WEAPON LOADOUT</Text>
          
          <View style={styles.weaponList}>
            {WEAPONS.map((w) => (
              <TouchableOpacity 
                key={w.id} 
                style={[
                  styles.weaponCard, 
                  currentWeapon === w.id && styles.selectedCard
                ]}
                onPress={() => onSelect(w.id)}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>{w.icon}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{w.name}</Text>
                  <Text style={styles.desc}>{w.description}</Text>
                  
                  <View style={styles.stats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>DMG</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { width: `${Math.min(100, w.damageMult * 20)}%`, backgroundColor: '#e74c3c' }]} />
                      </View>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>RATE</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { width: `${Math.min(100, w.fireRateMult * 30)}%`, backgroundColor: '#3498db' }]} />
                      </View>
                    </View>
                  </View>
                </View>
                {currentWeapon === w.id && <Text style={styles.equipped}>EQUIPPED</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>CONFIRM LOADOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: wp(6),
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: hp(3),
    letterSpacing: 3,
  },
  weaponList: {
    gap: hp(1.5),
  },
  weaponCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  iconBox: {
    width: wp(14),
    height: wp(14),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  icon: {
    fontSize: wp(8),
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: '900',
  },
  desc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(2.8),
    marginBottom: hp(1),
  },
  stats: {
    flexDirection: 'row',
    gap: wp(4),
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: wp(2),
    fontWeight: 'bold',
    marginRight: 5,
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
  equipped: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: COLORS.primary,
    fontSize: wp(2),
    fontWeight: '900',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: 15,
    marginTop: hp(4),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1a1a2e',
    fontSize: wp(4),
    fontWeight: '900',
  },
});
