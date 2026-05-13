import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

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

  async logout() {
    return this.signOut();
  }

  private async ensureUserExists() {
    if (!this.uid) return;
    try {
      const db = database();
      const snapshot = await db.ref(`/users/${this.uid}`).once('value');
      const userData = snapshot.val();
      
      if (!snapshot.exists() || !userData.referralCode) {
        const referralCode = this.uid.substring(0, 6).toUpperCase();
        const newData = {
          lifelines: userData?.lifelines || 5,
          level: userData?.level || 1,
          referralCode: referralCode,
          updatedAt: database.ServerValue.TIMESTAMP,
          createdAt: userData?.createdAt || database.ServerValue.TIMESTAMP,
        };
        await db.ref(`/users/${this.uid}`).update(newData);
        console.log('User data initialized for UID:', this.uid);
      }
    } catch (error) {
      console.warn('Error ensuring user exists:', error);
    }
  }

  async getLifelines(): Promise<number> {
    if (!this.uid) return 0;
    const snapshot = await database().ref(`/users/${this.uid}/lifelines`).once('value');
    return snapshot.val() || 0;
  }

  async updateLifelines(delta: number) {
    if (!this.uid) return;
    const ref = database().ref(`/users/${this.uid}/lifelines`);
    await ref.transaction((current) => (current || 0) + delta);
  }

  async updateLevel(level: number) {
    if (!this.uid) return;
    const db = database();
    await db.ref(`/users/${this.uid}/level`).set(level);
    await db.ref(`/leaderboard/${this.uid}`).set({
      name: auth().currentUser?.displayName || `Player_${this.uid.substring(0, 4)}`,
      level: level,
    });
  }

  async getReferralCode(): Promise<string> {
    if (!this.uid) return 'GAMER';
    
    const timeoutPromise = new Promise<string>((resolve) => 
      setTimeout(() => resolve('GAMER'), 3000)
    );
    
    const dbPromise = (async () => {
      try {
        const snapshot = await database().ref(`/users/${this.uid}/referralCode`).once('value');
        return snapshot.val() || 'GAMER';
      } catch (e) {
        return 'GAMER';
      }
    })();

    return Promise.race([dbPromise, timeoutPromise]);
  }

  async getLeaderboard() {
    try {
      const snapshot = await database()
        .ref('/leaderboard')
        .orderByChild('level')
        .limitToLast(20)
        .once('value');
      
      const data = snapshot.val();
      if (!data) return [];

      const leaderboard = Object.keys(data).map(key => ({
        ...data[key],
        id: key,
        isMe: key === this.uid
      })).sort((a, b) => b.level - a.level);

      return leaderboard;
    } catch (e) {
      console.warn('Leaderboard fetch failed:', e);
      return [];
    }
  }
}

export const firebaseManager = new FirebaseManager();
