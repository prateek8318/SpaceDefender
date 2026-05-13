import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EnemyEntity } from '../types/game.types';
import { COLORS } from '../utils/colors';

export const Enemy: React.FC<EnemyEntity> = memo((entity) => {
  const getEnemyStyle = () => {
    switch (entity.type) {
      case 'boss': return { frame: styles.bossFrame, core: styles.bossCore, glow: '#ff7675' };
      case 'tank': return { frame: styles.tankFrame, core: styles.tankCore, glow: '#a29bfe' };
      case 'fast': return { frame: styles.fastFrame, core: styles.fastCore, glow: '#43D7FF' };
      default: return { frame: styles.basicFrame, core: styles.basicCore, glow: '#ff5a66' };
    }
  };

  const style = getEnemyStyle();

  return (
    <View style={[styles.container, { left: entity.x, top: entity.y, width: entity.width, height: entity.height }]}>
      <View style={[styles.frame, style.frame]}>
        {/* Evil Core */}
        <View style={[styles.core, style.core]} />
        
        {/* Spikes/Wings */}
        <View style={styles.leftSpike} />
        <View style={styles.rightSpike} />
        
        {/* Eyes/Lights */}
        <View style={styles.leftEye} />
        <View style={styles.rightEye} />
        
        {/* Engine Glow */}
        <View style={[styles.engine, { backgroundColor: style.glow }]} />
      </View>
      
      {entity.hp > 1 && (
        <View style={styles.hpBadge}>
          <Text style={styles.hpText}>{entity.hp}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicFrame: {
    backgroundColor: '#1e0505',
    borderColor: '#ff5a66',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  fastFrame: {
    backgroundColor: '#05101e',
    borderColor: '#43D7FF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  tankFrame: {
    backgroundColor: '#10051e',
    borderColor: '#a29bfe',
    borderRadius: 12,
    borderWidth: 3,
  },
  bossFrame: {
    backgroundColor: '#1e0510',
    borderColor: '#ff7675',
    borderRadius: 20,
    borderWidth: 4,
  },
  core: {
    width: '40%',
    height: '40%',
    borderRadius: 999,
  },
  basicCore: { backgroundColor: '#ff5a66' },
  fastCore: { backgroundColor: '#43D7FF' },
  tankCore: { backgroundColor: '#a29bfe' },
  bossCore: { backgroundColor: '#ff7675', width: '60%', height: '60%' },
  
  leftSpike: {
    position: 'absolute',
    left: -10,
    width: 10,
    height: '60%',
    backgroundColor: 'inherit',
    borderColor: 'inherit',
    borderLeftWidth: 2,
  },
  rightSpike: {
    position: 'absolute',
    right: -10,
    width: 10,
    height: '60%',
    backgroundColor: 'inherit',
    borderColor: 'inherit',
    borderRightWidth: 2,
  },
  leftEye: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  rightEye: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  engine: {
    position: 'absolute',
    top: -5,
    width: '50%',
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  hpBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  hpText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
