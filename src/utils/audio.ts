import { TapSoundType, ZikrItem } from '../types';

export const TAP_SOUND_OPTIONS: { id: TapSoundType; label: string; description: string }[] = [
  { id: 'wood', label: 'Olive Wood', description: 'Traditional warm olive wood bead' },
  { id: 'water', label: 'Water Drop', description: 'Serene crystal water droplet' },
  { id: 'bell', label: 'Gentle Bell', description: 'Resonant singing meditation chime' },
  { id: 'click', label: 'Tally Clicker', description: 'Crisp mechanical counter click' },
  { id: 'whisper', label: 'Soft Felt', description: 'Quiet, cushioned discreet tap' },
  { id: 'none', label: 'Silent', description: 'Mute bead sound' },
];

// Web Audio API synthesizer for Tasbih clicks, bead styles, and celebration chimes
class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play bead tap sound according to selected style
  playTapSound(style: TapSoundType = 'wood') {
    if (style === 'none') return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (style) {
        case 'water': {
          // Serene acoustic water droplet (quick upward frequency sweep)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(1420, now + 0.05);

          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        case 'bell': {
          // Gentle Tibetan singing bell / warm metallic chime
          const baseFreq = 1046.5; // C6
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(baseFreq, now);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(baseFreq * 2.01, now); // subtle shimmer harmonic

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          break;
        }

        case 'click': {
          // Crisp mechanical tally counter click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(950, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.018);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'whisper': {
          // Soft subtle cushion / felt tap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'wood':
        default: {
          // Traditional warm olive wood bead click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(130, now + 0.038);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
      }
    } catch {
      // Ignore audio restrictions
    }
  }

  // Harmonious milestone chime when reaching target (e.g., 33 or 100)
  playGoalChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Ignore audio failures
    }
  }

  // Uplifting celebration chime when completing daily Zikr target goal
  playDailyGoalCelebrationChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    } catch {
      // Ignore audio failures
    }
  }

  // Soft subtle reset tone
  playResetSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio failures
    }
  }
}

// Recitation Player for Arabic pronunciation and custom audio MP3s
class RecitationPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private activeZikrId: string | null = null;
  private listeners: Set<(activeZikrId: string | null) => void> = new Set();

  subscribe(listener: (activeZikrId: string | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeZikrId));
  }

  getActiveZikrId(): string | null {
    return this.activeZikrId;
  }

  isPlaying(zikrId?: string): boolean {
    if (!zikrId) return this.activeZikrId !== null;
    return this.activeZikrId === zikrId;
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.activeZikrId = null;
    this.notify();
  }

  play(
    zikr: Pick<ZikrItem, 'id' | 'arabic' | 'transliteration' | 'audioUrl'>,
    onFinish?: () => void
  ) {
    // If currently reciting this exact phrase, toggle off
    if (this.activeZikrId === zikr.id) {
      this.stop();
      return;
    }

    // Stop any existing playback first
    this.stop();

    this.activeZikrId = zikr.id;
    this.notify();

    const cleanup = () => {
      if (this.activeZikrId === zikr.id) {
        this.activeZikrId = null;
        this.notify();
        if (onFinish) onFinish();
      }
    };

    // 1. If custom MP3 / audio link is provided, play high-quality audio element
    if (zikr.audioUrl && zikr.audioUrl.trim()) {
      try {
        const audio = new Audio(zikr.audioUrl.trim());
        this.currentAudio = audio;
        audio.onended = cleanup;
        audio.onerror = () => {
          // Fallback to speech synthesis if remote MP3 link fails
          this.fallbackSpeech(zikr.arabic, cleanup);
        };
        audio.play().catch(() => {
          this.fallbackSpeech(zikr.arabic, cleanup);
        });
        return;
      } catch {
        this.fallbackSpeech(zikr.arabic, cleanup);
        return;
      }
    }

    // 2. Native Arabic speech synthesis fallback for instant pronunciation
    this.fallbackSpeech(zikr.arabic, cleanup);
  }

  private fallbackSpeech(text: string, onEnd: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.82; // Calming, clear pace for dhikr
      utterance.pitch = 1.0;

      // Select Arabic voice if available on user device
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = onEnd;
      utterance.onerror = onEnd;

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd();
    }
  }
}

export const soundManager = new SoundManager();
export const recitationPlayer = new RecitationPlayer();
