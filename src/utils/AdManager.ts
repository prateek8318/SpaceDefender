import mobileAds, { 
  InterstitialAd, 
  RewardedAd, 
  AdEventType, 
  RewardedAdEventType, 
  TestIds 
} from 'react-native-google-mobile-ads';

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxx/zzzzzzzzzzzzzz';

class AdManager {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
  private interstitialLoaded = false;
  private rewardedLoaded = false;
  private initializing = false;

  constructor() {
    console.log('[AdManager V3] Initializing...');
    setTimeout(() => this.initialize(), 2000);
  }

  async initialize() {
    if (this.initializing) return;
    this.initializing = true;
    try {
      // await mobileAds().initialize();
      console.log('[AdManager V3] AdMob Disabled (Temporarily)');
      // this.loadInterstitial();
      // this.loadRewarded();
    } catch (error) {
      console.warn('[AdManager V3] Initialization failed:', error);
    } finally {
      this.initializing = false;
    }
  }

  private safeAddListener(ad: any, type: any, handler: Function) {
    try {
      if (ad && type) {
        ad.addAdEventListener(type, handler);
      }
    } catch (e) {
      console.warn(`[AdManager V3] Failed to add listener: ${type}`, e);
    }
  }

  private loadInterstitial() {
    try {
      this.interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId);
      
      this.safeAddListener(this.interstitial, AdEventType.LOADED, () => {
        this.interstitialLoaded = true;
      });

      this.safeAddListener(this.interstitial, AdEventType.CLOSED, () => {
        this.interstitialLoaded = false;
        this.loadInterstitial();
      });

      this.safeAddListener(this.interstitial, AdEventType.ERROR, () => {
        this.interstitialLoaded = false;
      });

      this.interstitial.load();
    } catch (e) {
      console.warn('[AdManager V3] Interstitial create failed:', e);
    }
  }

  private loadRewarded() {
    try {
      this.rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId);

      // Strict check for RewardedAd events
      this.safeAddListener(this.rewarded, RewardedAdEventType.LOADED, () => {
        console.log('[AdManager V3] Rewarded Loaded');
        this.rewardedLoaded = true;
      });

      this.safeAddListener(this.rewarded, RewardedAdEventType.EARNED_REWARD, (reward: any) => {
        console.log('[AdManager V3] Reward earned:', reward);
      });

      // Fallback for CLOSED/ERROR using strings
      this.safeAddListener(this.rewarded, 'closed', () => {
        console.log('[AdManager V3] Rewarded Closed');
        this.rewardedLoaded = false;
        this.loadRewarded();
      });

      this.safeAddListener(this.rewarded, 'error', () => {
        this.rewardedLoaded = false;
      });

      this.rewarded.load();
    } catch (e) {
      console.warn('[AdManager V3] Rewarded create failed:', e);
    }
  }

  showInterstitial() {
    if (this.interstitialLoaded && this.interstitial) {
      this.interstitial.show();
    } else {
      this.loadInterstitial();
    }
  }

  showRewardedAd(onAdDismissed: (earnedReward: boolean) => void): boolean {
    if (this.rewardedLoaded && this.rewarded) {
      let earned = false;

      const unsubscribeEarned = this.rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );

      const unsubscribeClosed = this.rewarded.addAdEventListener(
        'closed' as any,
        () => {
          onAdDismissed(earned);
          unsubscribeEarned();
          unsubscribeClosed();
        },
      );

      this.rewarded.show();
      return true;
    } else {
      console.log('[AdManager V3] Ad not ready, reloading...');
      this.loadRewarded();
      onAdDismissed(false);
      return false;
    }
  }

  isInterstitialLoaded() {
    return this.interstitialLoaded;
  }

  isRewardedLoaded() {
    return this.rewardedLoaded;
  }
}

export const adManager = new AdManager();
