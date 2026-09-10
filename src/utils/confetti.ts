import confetti from 'canvas-confetti';

/**
 * Triggers a subtle, elegant confetti animation effect for completing the Daily Zikr Target Goal.
 * Uses a refined, spiritual color palette (emerald greens, gentle warm golds, and soft cream)
 * with low particle count, gentle gravity, and low velocity to create a graceful, peaceful celebratory flutter.
 */
export function triggerSubtleDailyGoalConfetti() {
  if (typeof window === 'undefined') return;

  try {
    // Harmonious Dhikr-inspired color palette: Emeralds, Mint, Warm Gold, Amber, and Soft White
    const colors = [
      '#10B981', // Emerald 500
      '#059669', // Emerald 600
      '#34D399', // Emerald 400
      '#6EE7B7', // Mint 300
      '#F59E0B', // Amber 500
      '#FBBF24', // Gold 400
      '#FEF3C7', // Pearl Gold 100
      '#F8FAFC', // Slate 50
    ];

    // Stage 1: Soft, gentle center floating burst
    confetti({
      particleCount: 38,
      spread: 60,
      startVelocity: 24,
      origin: { x: 0.5, y: 0.62 },
      colors,
      gravity: 0.7,
      scalar: 0.85,
      ticks: 220,
      disableForReducedMotion: true,
      shapes: ['circle', 'square'],
    });

    // Stage 2: Staggered gentle side streams that drift inwards
    window.setTimeout(() => {
      // Left soft stream
      confetti({
        particleCount: 20,
        angle: 65,
        spread: 45,
        startVelocity: 22,
        origin: { x: 0.22, y: 0.68 },
        colors,
        gravity: 0.72,
        scalar: 0.75,
        ticks: 240,
        disableForReducedMotion: true,
        shapes: ['circle', 'square'],
      });

      // Right soft stream
      confetti({
        particleCount: 20,
        angle: 115,
        spread: 45,
        startVelocity: 22,
        origin: { x: 0.78, y: 0.68 },
        colors,
        gravity: 0.72,
        scalar: 0.75,
        ticks: 240,
        disableForReducedMotion: true,
        shapes: ['circle', 'square'],
      });
    }, 140);
  } catch (err) {
    console.warn('Unable to trigger confetti animation:', err);
  }
}

/**
 * Fast, mini confetti burst for round completions (e.g. 33 or 100 single rounds)
 */
export function triggerRoundConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 25,
      spread: 50,
      startVelocity: 20,
      origin: { y: 0.65 },
      colors: ['#10B981', '#059669', '#34D399', '#F59E0B'],
      gravity: 0.8,
      scalar: 0.75,
      ticks: 160,
      disableForReducedMotion: true,
    });
  } catch {
    // ignore
  }
}
