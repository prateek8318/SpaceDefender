import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Switch,
  ScrollView,
} from 'react-native';
import { COLORS } from '../utils/colors';
import { wp, hp } from '../utils/responsive';
import { soundManager } from '../utils/SoundManager';
import { firebaseManager } from '../utils/FirebaseManager';
import { getVolumeSettings, saveVolumeSettings, getGyroEnabled, saveGyroEnabled, clearAllData } from '../utils/storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [musicVol, setMusicVol] = useState(0.2);
  const [effectVol, setEffectVol] = useState(0.5);
  const [bulletVol, setBulletVol] = useState(0.3);
  const [gyroEnabled, setGyroEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const volumes = await getVolumeSettings();
      setMusicVol(volumes.music);
      setEffectVol(volumes.effect);
      setBulletVol(volumes.bullet);
      
      const gyro = await getGyroEnabled();
      setGyroEnabled(gyro);
    };
    if (visible) loadSettings();
  }, [visible]);

  const handleSaveVolumes = async (m: number, e: number, b: number) => {
    setMusicVol(m);
    setEffectVol(e);
    setBulletVol(b);
    soundManager.setMusicVolume(m);
    soundManager.setEffectVolume(e);
    soundManager.setBulletVolume(b);
    await saveVolumeSettings(m, e, b);
  };

  const handleGyroToggle = async (value: boolean) => {
    setGyroEnabled(value);
    await saveGyroEnabled(value);
  };

  const handleLogout = async () => {
    try {
      await firebaseManager.signOut();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const VolumeControl = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>
      <View style={styles.sliderContainer}>
        <TouchableOpacity onPress={() => onChange(Math.max(0, value - 0.1))} style={styles.volButton}>
          <Text style={styles.volButtonText}>-</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${value * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={() => onChange(Math.min(1, value + 0.1))} style={styles.volButton}>
          <Text style={styles.volButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>SETTINGS</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>AUDIO CONTROLS</Text>
            <VolumeControl 
              label="MUSIC" 
              value={musicVol} 
              onChange={(v) => handleSaveVolumes(v, effectVol, bulletVol)} 
            />
            <VolumeControl 
              label="EFFECTS" 
              value={effectVol} 
              onChange={(v) => handleSaveVolumes(musicVol, v, bulletVol)} 
            />
            <VolumeControl 
              label="BULLETS" 
              value={bulletVol} 
              onChange={(v) => handleSaveVolumes(musicVol, effectVol, v)} 
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>CONTROLS</Text>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.controlLabel}>GYROSCOPE (ZYRO)</Text>
                <Text style={styles.subLabel}>Tilt device to move ship</Text>
              </View>
              <Switch
                value={gyroEnabled}
                onValueChange={handleGyroToggle}
                trackColor={{ false: '#333', true: '#3498db' }}
                thumbColor={gyroEnabled ? '#fff' : '#888'}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>LOGOUT MISSION</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.versionText}>v1.0.4 - Premium Edition</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: '#0a0a1a',
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: '900',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: wp(6),
  },
  scrollContent: {
    padding: wp(5),
  },
  sectionTitle: {
    color: '#3498db',
    fontSize: wp(3.5),
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  controlRow: {
    marginBottom: hp(3),
  },
  controlLabel: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: hp(1),
  },
  subLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: wp(2.8),
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  volButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  volButtonText: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  progressBarBg: {
    flex: 1,
    height: hp(1.2),
    backgroundColor: '#111',
    borderRadius: hp(0.6),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: hp(2),
  },
  logoutButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
    marginTop: hp(2),
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: wp(4),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  versionText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: wp(2.5),
    textAlign: 'center',
    paddingBottom: hp(2),
  },
});
