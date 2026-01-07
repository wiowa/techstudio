import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type FeedbackType = 'success' | 'error' | 'warning' | 'light';

export const triggerFeedback = async (type: FeedbackType): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    // Mobile: Native iOS haptic
    const style =
      type === 'success'
        ? ImpactStyle.Light
        : type === 'error'
          ? ImpactStyle.Heavy
          : type === 'warning'
            ? ImpactStyle.Medium
            : ImpactStyle.Light;

    await Haptics.impact({ style });
  } else {
    // Web: Vibration API
    if ('vibrate' in navigator) {
      const pattern =
        type === 'success'
          ? 50
          : type === 'error'
            ? [100, 50, 100]
            : type === 'warning'
              ? [50, 30, 50]
              : 30;

      navigator.vibrate(pattern);
    }
  }
};

// Game-specific patterns
export const feedbackPatterns = {
  cardFlip: () => triggerFeedback('light'),
  matchFound: () => triggerFeedback('success'),
  matchFailed: () => triggerFeedback('error'),
  roundComplete: () => triggerFeedback('warning'),
};
