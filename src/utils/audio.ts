import { TapSoundType, ZikrItem } from '../types';
import { DEFAULT_ZIKRS } from '../data/defaultZikr';

export const TAP_SOUND_OPTIONS: { id: TapSoundType; label: string; description: string }[] = [
  { id: 'wood', label: 'Olive Wood', description: 'Traditional warm olive wood bead' },
  { id: 'voice', label: 'Voice Recitation', description: 'Recites the phrase audio on each tap' },
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

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        const startTime = ctx.currentTime + idx * 0.08;
        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch {
      // Ignore audio failures
    }
  }

  // Grand celebration fanfare on completing entire daily goal
  playDailyCompletionFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major chord
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        const startTime = ctx.currentTime + idx * 0.06;
        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    } catch {
      // Ignore audio failures
    }
  }

  // Alias for daily celebration chime
  playDailyGoalCelebrationChime() {
    this.playDailyCompletionFanfare();
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

type RecitationListener = (activeZikrId: string | null, isLoading: boolean, error: string | null) => void;

/**
 * Resolves a public asset path against the current deployment base URL.
 * Handles GitHub Pages (https://<user>.github.io/<repo>/), Vite subpaths, and root domains.
 */
export function resolvePublicAssetUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Return full HTTP/HTTPS, blob, data URIs untouched
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Strip leading slashes and relative dot prefixes
  const cleanPath = trimmed.replace(/^(\.|\/)+/, '');

  // 1. If Vite configured a non-root base URL (e.g., base: '/repo-name/' or base: './')
  const viteBase = import.meta.env.BASE_URL;
  if (viteBase && viteBase !== '/' && viteBase !== './') {
    const prefix = viteBase.endsWith('/') ? viteBase : `${viteBase}/`;
    return `${prefix}${cleanPath}`;
  }

  // 2. Runtime browser path auto-detection:
  // Detect GitHub Pages (e.g. https://username.github.io/my-tasbih/) or sub-paths
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    if (hostname.endsWith('github.io')) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && !segments[0].includes('.') && segments[0] !== 'assets' && segments[0] !== 'audio') {
        const repoName = segments[0];
        return `/${repoName}/${cleanPath}`;
      }
    }

    // General sub-path check (e.g. hosted under /subdirectory/)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1 && !segments[0].includes('.') && segments[0] !== 'assets' && segments[0] !== 'audio' && segments[0] !== 'api') {
      return `/${segments[0]}/${cleanPath}`;
    }
  }

  return `/${cleanPath}`;
}

/**
 * Returns alternative fallback URLs for built-in audio recitations
 * (checks both /assets/aistudio/audio/ and /audio/recitations/).
 */
export function getAlternateAudioUrl(url: string): string | null {
  if (url.includes('/assets/aistudio/audio/')) {
    return url.replace('/assets/aistudio/audio/', '/audio/recitations/');
  }
  if (url.includes('/audio/recitations/')) {
    return url.replace('/audio/recitations/', '/assets/aistudio/audio/');
  }
  return null;
}

// Recitation Player for Arabic pronunciation and custom audio MP3s
class RecitationPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeZikrId: string | null = null;
  private isLoading: boolean = false;
  private lastError: string | null = null;
  private listeners: Set<RecitationListener> = new Set();
  private arabicVoicesLoaded: boolean = false;
  private tapAudioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.arabicVoicesLoaded = true;
      };
    }
  }

  playTapAudio(zikr: Pick<ZikrItem, 'id' | 'arabic' | 'audioUrl'>) {
    const defaultMatch = DEFAULT_ZIKRS.find((d) => d.id === zikr.id);
    let targetUrl = zikr.audioUrl?.trim();
    if (
      !targetUrl ||
      targetUrl.includes('myinstants.com/en/instant') ||
      targetUrl.includes('myinstants.com/instant') ||
      targetUrl.includes('everyayah.com') ||
      targetUrl.startsWith('/audio/')
    ) {
      targetUrl = defaultMatch?.audioUrl;
    }
    if (!targetUrl) {
      soundManager.playTapSound('wood');
      return;
    }

    const resolvedUrl = resolvePublicAssetUrl(targetUrl);

    try {
      let audio = this.tapAudioCache.get(resolvedUrl);
      if (!audio) {
        audio = new Audio(resolvedUrl);
        audio.preload = 'auto';
        this.tapAudioCache.set(resolvedUrl, audio);

        audio.onerror = () => {
          const alt = getAlternateAudioUrl(resolvedUrl);
          if (alt && audio) {
            audio.src = resolvePublicAssetUrl(alt);
            audio.play().catch(() => {
              soundManager.playTapSound('wood');
            });
          } else {
            soundManager.playTapSound('wood');
          }
        };
      }
      audio.currentTime = 0;
      audio.play().catch(() => {
        soundManager.playTapSound('wood');
      });
    } catch {
      soundManager.playTapSound('wood');
    }
  }

  subscribe(listener: RecitationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeZikrId, this.isLoading, this.lastError));
  }

  getActiveZikrId(): string | null {
    return this.activeZikrId;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getLastError(): string | null {
    return this.lastError;
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
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.currentUtterance = null;
    }

    this.activeZikrId = null;
    this.isLoading = false;
    this.notify();
  }

  play(
    zikr: Pick<ZikrItem, 'id' | 'arabic' | 'transliteration' | 'audioUrl'>,
    onFinish?: () => void,
    onError?: (err: string) => void
  ) {
    // If currently reciting this exact phrase, toggle off
    if (this.activeZikrId === zikr.id) {
      this.stop();
      return;
    }

    // Stop any existing playback first
    this.stop();

    this.activeZikrId = zikr.id;
    this.isLoading = true;
    this.lastError = null;
    this.notify();

    const cleanup = () => {
      if (this.activeZikrId === zikr.id) {
        this.activeZikrId = null;
        this.isLoading = false;
        this.notify();
        if (onFinish) onFinish();
      }
    };

    const handleFail = (msg: string) => {
      if (this.activeZikrId === zikr.id) {
        this.lastError = msg;
        this.isLoading = false;
        this.activeZikrId = null;
        this.notify();
        if (onError) onError(msg);
      }
    };

    // 1. If custom MP3 / audio link or default preset audio is provided, play high-quality audio element
    const defaultMatch = DEFAULT_ZIKRS.find((d) => d.id === zikr.id);
    let targetSrc = zikr.audioUrl?.trim();
    if (
      !targetSrc ||
      targetSrc.includes('myinstants.com/en/instant') ||
      targetSrc.includes('myinstants.com/instant') ||
      targetSrc.includes('everyayah.com') ||
      targetSrc.startsWith('/audio/')
    ) {
      targetSrc = defaultMatch?.audioUrl;
    }

    if (targetSrc) {
      const resolvedSrc = resolvePublicAssetUrl(targetSrc);
      const defaultResolvedSrc = defaultMatch?.audioUrl ? resolvePublicAssetUrl(defaultMatch.audioUrl) : undefined;
      const altSrc = getAlternateAudioUrl(resolvedSrc);

      try {
        const audio = new Audio();
        this.currentAudio = audio;
        audio.preload = 'auto';
        audio.src = resolvedSrc;

        audio.oncanplaythrough = () => {
          if (this.activeZikrId === zikr.id) {
            this.isLoading = false;
            this.notify();
          }
        };

        audio.onplaying = () => {
          if (this.activeZikrId === zikr.id) {
            this.isLoading = false;
            this.notify();
          }
        };

        audio.onended = () => {
          cleanup();
        };

        let hasTriedAlternate = false;

        audio.onerror = () => {
          if (!hasTriedAlternate && altSrc) {
            hasTriedAlternate = true;
            console.warn('Retrying with alternative audio path:', altSrc);
            audio.src = resolvePublicAssetUrl(altSrc);
            audio.play().catch(() => {
              this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
            });
            return;
          }

          if (defaultResolvedSrc && resolvedSrc !== defaultResolvedSrc) {
            console.warn('Custom audio failed, retrying default bundled audio for:', zikr.id);
            audio.src = defaultResolvedSrc;
            audio.play().catch(() => {
              this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
            });
            return;
          }

          console.warn('Audio link failed, falling back to speech synthesis for:', zikr.arabic);
          this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (this.activeZikrId === zikr.id) {
                this.isLoading = false;
                this.notify();
              }
            })
            .catch((err) => {
              console.warn('Audio element play error:', err);
              if (!hasTriedAlternate && altSrc) {
                hasTriedAlternate = true;
                audio.src = resolvePublicAssetUrl(altSrc);
                audio.play().catch(() => {
                  this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
                });
                return;
              }
              if (defaultResolvedSrc && resolvedSrc !== defaultResolvedSrc) {
                audio.src = defaultResolvedSrc;
                audio.play().catch(() => {
                  this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
                });
                return;
              }
              this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
            });
        }
        return;
      } catch (err: any) {
        console.warn('Could not initialize audio:', err);
        this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
        return;
      }
    }

    // 2. Native Arabic speech synthesis fallback for instant pronunciation
    this.fallbackSpeech(zikr.arabic, cleanup, handleFail);
  }

  private fallbackSpeech(
    text: string,
    onEnd: () => void,
    onFail: (err: string) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onFail('Speech audio is not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Check if paused and resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance; // Prevent garbage collection bug in Chrome
      utterance.lang = 'ar-SA';
      utterance.rate = 0.82; // Calming pace for dhikr
      utterance.pitch = 1.0;

      // Select Arabic voice if available on user device
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice =
        voices.find((v) => v.lang.startsWith('ar')) ||
        voices.find((v) => v.lang.includes('ar'));

      if (arabicVoice) {
        utterance.voice = arabicVoice;
      } else if (!this.arabicVoicesLoaded && voices.length === 0) {
        // Wait briefly for onvoiceschanged in Chromium
        const voiceHandler = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const av = updatedVoices.find((v) => v.lang.startsWith('ar'));
          if (av) utterance.voice = av;
        };
        window.speechSynthesis.addEventListener('voiceschanged', voiceHandler, { once: true });
      }

      this.isLoading = false;
      this.notify();

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        console.warn('Speech synthesis error:', e);
        if (!arabicVoice && !voices.some((v) => v.lang.startsWith('ar'))) {
          onFail('No Arabic speech voice found on your device. Add an MP3 link in Edit Zikr to play recitations.');
        } else {
          onFail('Audio recitation was interrupted.');
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error('Speech synthesis failure:', err);
      onFail('Audio playback could not start.');
    }
  }
}

export const soundManager = new SoundManager();
export const recitationPlayer = new RecitationPlayer();
