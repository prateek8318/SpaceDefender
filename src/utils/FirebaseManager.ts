import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class FirebaseManager {
  private uid: string | null = null;

  constructor() {
    this.observeAuthState();
  }

  private observeAuthState() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.uid = user.uid;
        this.ensureUserExists();
      } else {
        this.uid = null;
      }
    });
  }

  get currentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  async signInAnonymously() {
    try {
      const credential = await auth().signInAnonymously();
      this.uid = credential.user.uid;
      await this.ensureUserExists();
      return credential.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await auth().signOut();
      this.uid = null;
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }

  private async ensureUserExists() {
    if (!this.uid) return;
    try {
      const userDoc = await firestore().collection('users').doc(this.uid).get();
      
      if (!userDoc.exists) {
        const referralCode = this.uid.substring(0, 6).toUpperCase();
        const newData = {
          lifelines: 5,
          level: 1,
          bestScore: 0,
          coins: 0,
          referralCode: referralCode,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await firestore().collection('users').doc(this.uid).set(newData);
        console.log('User data initialized in Firestore for UID:', this.uid);
      }
    } catch (error) {
      console.warn('Error ensuring user exists in Firestore:', error);
    }
  }

  async updateHighScore(score: number, level: number) {
    if (!this.uid) return;
    try {
      const userRef = firestore().collection('users').doc(this.uid);
      const userDoc = await userRef.get();
      const currentBest = userDoc.data()?.bestScore || 0;

      if (score > currentBest) {
        const timestamp = firestore.FieldValue.serverTimestamp();
        await userRef.set({ 
          bestScore: score, 
          level: level,
          updatedAt: timestamp
        }, { merge: true });

        // Update Global Leaderboard
        await firestore().collection('leaderboard').doc(this.uid).set({
          name: auth().currentUser?.displayName || `Commander_${this.uid.substring(0, 4)}`,
          score: score,
          level: level,
          uid: this.uid,
          updatedAt: timestamp,
        });
      }
    } catch (error) {
      console.error('Error updating high score:', error);
    }
  }

  async getLeaderboard(limitCount: number = 50) {
    try {
      const snapshot = await firestore()
        .collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        isMe: doc.id === this.uid
      }));
    } catch (e) {
      console.warn('Firestore Leaderboard fetch failed:', e);
      return [];
    }
  }
  
  async getUserLeaderboardEntry() {
    if (!this.uid) return null;
    try {
      const doc = await firestore().collection('leaderboard').doc(this.uid).get();
      if (doc.exists) {
        return { ...doc.data(), id: doc.id, isMe: true };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async syncCoins(totalCoins: number) {
    if (!this.uid) return;
    try {
      await firestore().collection('users').doc(this.uid).set({
        coins: totalCoins,
        updatedAt: firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing coins:', error);
    }
  }
}

export const firebaseManager = new FirebaseManager();
