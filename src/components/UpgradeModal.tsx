import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Animated 
} from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { getCoins, getUpgrades, saveUpgradeLevel, subtractCoins, Upgrades } from '../utils/storage';

interface UpgradeItem {
  id: keyof Upgrades;
  name: string;
  description: string;
  costs: number[];
  icon: string;
}

const UPGRADE_LIST: UpgradeItem[] = [
  { id: 'fireRate', name: 'FIRE RATE', description: 'Faster bullet intervals', costs: [100, 250, 500], icon: '🔫' },
  { id: 'damage', name: 'BULLET DAMAGE', description: 'More HP damage per hit', costs: [100, 300, 600], icon: '💥' },
  { id: 'armor', name: 'HULL ARMOR', description: 'Reduce incoming damage', costs: [150, 350, 700], icon: '🛡️' },
  { id: 'shieldDuration', name: 'SHIELD TIME', description: '+2s per tier duration', costs: [200, 400, 800], icon: '⏲️' },
  { id: 'bombCount', name: 'BOMB COUNT', description: 'Extra bombs per level', costs: [250, 500, 1000], icon: '💣' },
  { id: 'magnet', name: 'MAGNET', description: 'Auto-collect power-ups', costs: [300, 600, 1200], icon: '🧲' },
];

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ visible, onClose }) => {
  const [coins, setCoins] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrades | null>(null);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const c = await getCoins();
    const u = await getUpgrades();
    setCoins(c);
    setUpgrades(u);
  };

  const handleUpgrade = async (item: UpgradeItem) => {
    if (!upgrades) return;
    const currentLevel = upgrades[item.id];
    if (currentLevel >= 3) return;

    const cost = item.costs[currentLevel];
    const success = await subtractCoins(cost);

    if (success) {
      await saveUpgradeLevel(item.id, currentLevel + 1);
      await loadData();
    }
  };

  if (!upgrades) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SHIP UPGRADES</Text>
            <View style={styles.coinBadge}>
              <Text style={styles.coinText}>💰 {coins}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {UPGRADE_LIST.map((item) => {
              const level = upgrades[item.id];
              const isMax = level >= 3;
              const cost = isMax ? 'MAX' : item.costs[level];

              return (
                <View key={item.id} style={styles.upgradeCard}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                    
                    <View style={styles.progressContainer}>
                      {[1, 2, 3].map((step) => (
                        <View 
                          key={step} 
                          style={[
                            styles.progressStep, 
                            step <= level && styles.progressStepActive 
                          ]} 
                        />
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.buyButton, 
                      (isMax || coins < (cost as number)) && styles.buyButtonDisabled
                    ]}
                    onPress={() => handleUpgrade(item)}
                    disabled={isMax || coins < (cost as number)}
                  >
                    <Text style={styles.buyText}>{isMax ? 'MAX' : cost}</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
    padding: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  title: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: '900',
    letterSpacing: 2,
  },
  coinBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1c40f',
  },
  coinText: {
    color: '#f1c40f',
    fontSize: wp(4),
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: hp(5),
  },
  upgradeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: wp(4),
    marginBottom: hp(1.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardIcon: {
    width: wp(12),
    height: wp(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: wp(6),
  },
  cardInfo: {
    flex: 1,
    marginLeft: wp(4),
  },
  cardName: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: '800',
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(2.8),
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: hp(1),
  },
  progressStep: {
    height: 6,
    width: wp(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 4,
    borderRadius: 3,
  },
  progressStepActive: {
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  buyButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 8,
    minWidth: wp(18),
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  buyText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: wp(3.5),
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: hp(1.8),
    borderRadius: 15,
    alignItems: 'center',
    marginTop: hp(2),
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: wp(4.5),
    letterSpacing: 2,
  },
});
