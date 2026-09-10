export const triggerHaptic = (type: 'tap' | 'goal' | 'reset' = 'tap') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tap':
        // Crisp, short tactile bump
        navigator.vibrate(18);
        break;
      case 'goal':
        // Rewarding celebratory pulse pattern (vibrate, pause, vibrate, pause, longer vibrate)
        navigator.vibrate([40, 60, 40, 60, 80]);
        break;
      case 'reset':
        // Double micro pulse
        navigator.vibrate([15, 30, 15]);
        break;
    }
  } catch {
    // Vibration can throw SecurityError in restricted iframes; safe to ignore
  }
};
