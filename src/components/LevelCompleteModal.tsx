import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated,
  Share 
} from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { soundManager } from '../utils/SoundManager';

interface LevelCompleteModalProps {
  visible: boolean;
  score: number;
  coins: number;
  stars: number;
  bestCombo: number;
  enemiesKilled: number;
  isPersonalBest: boolean;
  onNextLevel: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  visible,
  score,
  coins,
  stars,
  bestCombo,
  enemiesKilled,
  isPersonalBest,
  onNextLevel,
  onHome,
}) => {
  const [starAnims] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [contentOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Reset animations
      starAnims.forEach(anim => anim.setValue(0));
      contentOpacity.setValue(0);

      // Start sequence
      Animated.sequence([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.stagger(300, starAnims.slice(0, stars).map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          })
        )),
      ]).start();

      if (stars > 0) {
        soundManager.playLevelUpSound();
      }
    }
  }, [visible, stars]);

  const handleShare = async () => {
    try {
      const message = `🚀 Mission Accomplished! \n\nI scored ${score} points and earned ${stars} stars in Space Defender! \n\nCan you beat my record? 🎮`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing score:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          <Text style={styles.title}>MISSION COMPLETE</Text>
          
          <View style={styles.starsContainer}>
            {starAnims.map((anim, i) => (
              <Animated.Text 
                key={i} 
                style={[
                  styles.star, 
                  { 
                    opacity: i < stars ? 1 : 0.2,
                    transform: [{ scale: anim }]
                  }
                ]}
              >
                ⭐
              </Animated.Text>
            ))}
          </View>

          {isPersonalBest && (
            <View style={styles.pbBadge}>
              <Text style={styles.pbText}>PERSONAL BEST!</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>COINS EARNED</Text>
              <Text style={styles.statValue}>💰 {coins}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>BEST COMBO</Text>
              <Text style={styles.statValue}>x{bestCombo}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>ENEMIES KILLED</Text>
              <Text style={styles.statValue}>{enemiesKilled}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.nextButton} onPress={onNextLevel}>
              <Text style={styles.nextButtonText}>NEXT MISSION</Text>
            </TouchableOpacity>

            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.homeButton} onPress={onHome}>
                <Text style={styles.homeButtonText}>HOME</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareButtonText}>SHARE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1a1a2e',
    width: wp(85),
    borderRadius: 25,
    padding: wp(8),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  title: {
    color: '#3498db',
    fontSize: wp(7),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: hp(2),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: hp(3),
  },
  star: {
    fontSize: wp(12),
    marginHorizontal: 5,
    textShadowColor: '#f1c40f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pbBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    borderRadius: 15,
    marginBottom: hp(2),
  },
  pbText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: wp(3),
  },
  statsContainer: {
    width: '100%',
    marginBottom: hp(4),
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: wp(4),
    borderRadius: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(3.5),
    fontWeight: '700',
  },
  statValue: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: '900',
  },
  buttonContainer: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#3498db',
    paddingVertical: hp(2),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  nextButtonText: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '48%',
    paddingVertical: hp(1.5),
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    width: '48%',
    paddingVertical: hp(1.5),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  shareButtonText: {
    color: '#2ecc71',
    fontSize: wp(3.5),
    fontWeight: '900',
  },
});
