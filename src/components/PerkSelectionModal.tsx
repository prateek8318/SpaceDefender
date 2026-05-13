import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated,
  Platform
} from 'react-native';
import { Perk, PerkType } from '../types/game.types';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';

const ALL_PERKS: Perk[] = [
  { id: 'pierce', name: 'Piercing Rounds', description: 'Bullets pass through enemies', icon: '🏹' },
  { id: 'autoShield', name: 'Ghost Shield', description: 'Shield auto-regens every 30s', icon: '👻' },
  { id: 'doubleCoins', name: 'Greed King', description: '2x Coins, but start with 1 life', icon: '👑' },
  { id: 'luckyDrop', name: 'Lucky Clover', description: '2x Power-up drop rate', icon: '🍀' },
  { id: 'autoBomb', name: 'Smart Bomb', description: 'Auto-bomb every 45s', icon: '🛰️' },
  { id: 'speed', name: 'Warp Drive', description: '+20% movement speed', icon: '⚡' },
  { id: 'alwaysMulti', name: 'Triple Threat', description: 'Always Multi-Shot, -30% Damage', icon: '🔱' },
  { id: 'freeze', name: 'Ice Beam', description: '10% chance to freeze enemies', icon: '❄️' },
  { id: 'scoreX2', name: 'High Flyer', description: '2x Score multiplier', icon: '📈' },
  { id: 'extraLife', name: 'Heart Container', description: '+1 Max Life at start', icon: '💖' },
  { id: 'largeBullets', name: 'Big Bertha', description: '50% larger bullets', icon: '🌑' },
  { id: 'alwaysRapid', name: 'Overclocked', description: 'Always Rapid-Fire, -20% Speed', icon: '🔥' },
];

interface PerkSelectionModalProps {
  visible: boolean;
  onSelect: (perk: PerkType) => void;
}

export const PerkSelectionModal: React.FC<PerkSelectionModalProps> = ({
  visible,
  onSelect,
}) => {
  const [choices, setChoices] = useState<Perk[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Pick 3 random unique perks
      const shuffled = [...ALL_PERKS].sort(() => 0.5 - Math.random());
      setChoices(shuffled.slice(0, 3));
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.title}>CHOOSE YOUR PERK</Text>
          <Text style={styles.subtitle}>Select one tactical advantage for this run</Text>

          <View style={styles.perkList}>
            {choices.map((perk) => (
              <TouchableOpacity 
                key={perk.id} 
                style={styles.perkCard}
                onPress={() => onSelect(perk.id)}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{perk.icon}</Text>
                </View>
                <View style={styles.perkInfo}>
                  <Text style={styles.perkName}>{perk.name}</Text>
                  <Text style={styles.perkDesc}>{perk.description}</Text>
                </View>
                <Text style={styles.selectArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: wp(90),
    alignItems: 'center',
    padding: wp(5),
  },
  title: {
    color: COLORS.primary,
    fontSize: wp(8),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: hp(1),
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: wp(3.5),
    marginBottom: hp(5),
    textAlign: 'center',
  },
  perkList: {
    width: '100%',
    gap: hp(2),
  },
  perkCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: wp(15),
    height: wp(15),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  icon: {
    fontSize: wp(8),
  },
  perkInfo: {
    flex: 1,
  },
  perkName: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '900',
    marginBottom: hp(0.5),
  },
  perkDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(3.2),
  },
  selectArrow: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: 'bold',
    marginLeft: wp(2),
  },
});
