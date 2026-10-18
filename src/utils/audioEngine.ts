/**
 * Web Audio synthesizer, background music tracks, and comic SFX engine
 * for Mother's Day Cartoon Reel.
 * Supports synthesized cartoon sound effects ('boing', 'pop', 'applause', 'sparkle', 'whoosh')
 * and background melodies, with exportable MediaStreamAudioDestinationNode.
 */

export interface MusicTrackOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TransitionSFXOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const MUSIC_TRACKS: MusicTrackOption[] = [
  {
    id: 'lullaby',
    name: 'Melodía Tierna de Cuna (Predeterminada)',
    description: 'Arpegios suaves de piano y vibráfono cálido',
    icon: '🎵',
  },
  {
    id: 'acoustic',
    name: 'Acústico Sentimental',
    description: 'Acordes cálidos y nostálgicos de guitarra dulce',
    icon: '✨',
  },
  {
    id: 'musicbox',
    name: 'Caja Musical Nostálgica',
    description: 'Campanas de cristal y notas de ensueño',
    icon: '⭐',
  },
  {
    id: 'custom',
    name: 'Mi propia música (MP3 / Audio)',
    description: 'Subí tu canción o mensaje de voz favorito',
    icon: '🎧',
  },
  {
    id: 'none',
    name: 'Sin música',
    description: 'Video mudo sin pista sonora',
    icon: '🔇',
  },
];

export const TRANSITION_SFX_OPTIONS: TransitionSFXOption[] = [
  {
    id: 'boing',
    name: 'Boing de Historieta',
    emoji: '🌀',
    description: 'Resorte clásico de dibujo animado con rebote cómico',
  },
  {
    id: 'pop',
    name: 'Pop Cómic de Burbuja',
    emoji: '🫧',
    description: 'Estallido seco y simpático al cambiar de viñeta',
  },
  {
    id: 'applause',
    name: 'Aplausos & Festejo',
    emoji: '👏',
    description: 'Ovación de palmas celebrando a mamá',
  },
  {
    id: 'sparkle',
    name: 'Campanitas & Destello',
    emoji: '✨',
    description: 'Chispas mágicas de amor al revelar la foto real',
  },
  {
    id: 'whoosh',
    name: 'Whoosh de Viñeta',
    emoji: '💨',
    description: 'Giro dinámico de página de cómic',
  },
  {
    id: 'none',
    name: 'Sin efecto SFX',
    emoji: '🔇',
    description: 'Solo música de fondo sin sonido de cambio',
  },
];

interface NoteEvent {
  time: number;
  freq: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
}

// Melody note frequencies (Hz)
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const G5 = 783.99;

const TRACK_NOTES: Record<string, NoteEvent[]> = {
  lullaby: [
    { time: 0.05, freq: C4, duration: 1.2, gain: 0.28, type: 'sine' },
    { time: 0.1, freq: G4, duration: 0.8, gain: 0.22, type: 'triangle' },
    { time: 0.35, freq: E4, duration: 0.9, gain: 0.24, type: 'sine' },
    { time: 0.65, freq: C5, duration: 1.1, gain: 0.26, type: 'sine' },
    { time: 1.1, freq: G4, duration: 0.7, gain: 0.2, type: 'triangle' },
    { time: 1.35, freq: E4, duration: 0.7, gain: 0.2, type: 'sine' },
    { time: 1.7, freq: A4, duration: 0.8, gain: 0.25, type: 'sine' },
    { time: 2.0, freq: C5, duration: 0.9, gain: 0.25, type: 'sine' },
    { time: 2.3, freq: E5, duration: 1.2, gain: 0.28, type: 'triangle' },
    { time: 2.5, freq: F4, duration: 1.4, gain: 0.3, type: 'sine' },
    { time: 2.7, freq: A4, duration: 0.9, gain: 0.25, type: 'sine' },
    { time: 3.0, freq: C5, duration: 1.0, gain: 0.28, type: 'sine' },
    { time: 3.3, freq: D5, duration: 0.9, gain: 0.25, type: 'triangle' },
    { time: 3.7, freq: G4, duration: 1.2, gain: 0.28, type: 'sine' },
    { time: 3.9, freq: B4, duration: 0.9, gain: 0.22, type: 'triangle' },
    { time: 4.2, freq: C5, duration: 1.6, gain: 0.32, type: 'sine' },
    { time: 4.4, freq: E5, duration: 1.4, gain: 0.26, type: 'sine' },
    { time: 4.6, freq: G5, duration: 1.5, gain: 0.2, type: 'triangle' },
  ],
  acoustic: [
    { time: 0.05, freq: C4, duration: 0.6, gain: 0.3, type: 'triangle' },
    { time: 0.2, freq: E4, duration: 0.6, gain: 0.25, type: 'triangle' },
    { time: 0.4, freq: G4, duration: 0.6, gain: 0.25, type: 'triangle' },
    { time: 0.7, freq: B4, duration: 0.7, gain: 0.22, type: 'triangle' },
    { time: 1.1, freq: A4, duration: 0.8, gain: 0.28, type: 'triangle' },
    { time: 1.4, freq: C5, duration: 0.8, gain: 0.25, type: 'triangle' },
    { time: 1.8, freq: E5, duration: 0.9, gain: 0.26, type: 'triangle' },
    { time: 2.2, freq: D5, duration: 0.7, gain: 0.22, type: 'triangle' },
    { time: 2.5, freq: F4, duration: 0.8, gain: 0.3, type: 'triangle' },
    { time: 2.7, freq: A4, duration: 0.8, gain: 0.26, type: 'triangle' },
    { time: 3.0, freq: C5, duration: 0.9, gain: 0.28, type: 'triangle' },
    { time: 3.4, freq: D5, duration: 0.8, gain: 0.25, type: 'triangle' },
    { time: 3.9, freq: G4, duration: 0.9, gain: 0.28, type: 'triangle' },
    { time: 4.2, freq: B4, duration: 0.9, gain: 0.25, type: 'triangle' },
    { time: 4.4, freq: C5, duration: 1.4, gain: 0.32, type: 'triangle' },
  ],
  musicbox: [
    { time: 0.08, freq: E5, duration: 1.1, gain: 0.25, type: 'sine' },
    { time: 0.35, freq: G5, duration: 0.9, gain: 0.22, type: 'sine' },
    { time: 0.7, freq: C5, duration: 1.2, gain: 0.24, type: 'sine' },
    { time: 1.15, freq: D5, duration: 0.8, gain: 0.2, type: 'sine' },
    { time: 1.5, freq: E5, duration: 1.0, gain: 0.24, type: 'sine' },
    { time: 1.9, freq: G5, duration: 1.0, gain: 0.22, type: 'sine' },
    { time: 2.4, freq: A4 * 2, duration: 1.2, gain: 0.26, type: 'sine' },
    { time: 2.8, freq: G5, duration: 1.1, gain: 0.24, type: 'sine' },
    { time: 3.3, freq: E5, duration: 1.0, gain: 0.24, type: 'sine' },
    { time: 3.8, freq: D5, duration: 1.1, gain: 0.22, type: 'sine' },
    { time: 4.2, freq: C5, duration: 1.7, gain: 0.3, type: 'sine' },
  ],
};

export class VideoAudioPlayer {
  private ctx: AudioContext | null = null;
  private customAudioEl: HTMLAudioElement | null = null;
  private customMediaSource: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  public isPlaying = false;

  constructor() {}

  public ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (!this.sfxGainNode) {
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }
    if (!this.destinationNode) {
      this.destinationNode = this.ctx.createMediaStreamDestination();
      this.gainNode.connect(this.destinationNode);
      this.sfxGainNode.connect(this.destinationNode);
    }
    return this.ctx;
  }

  public getAudioStream(): MediaStreamTrack | null {
    if (this.destinationNode) {
      const tracks = this.destinationNode.stream.getAudioTracks();
      return tracks.length > 0 ? tracks[0] : null;
    }
    return null;
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      const clamped = Math.max(0, Math.min(volume, 1));
      this.gainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    for (const item of this.activeOscillators) {
      try {
        item.osc.stop();
        item.osc.disconnect();
        item.gain.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeOscillators = [];

    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
    }
  }

  /**
   * Synthesizes comic SFX for Scene 1 -> Scene 2 transition.
   */
  public playTransitionSFX(sfxId: string) {
    if (sfxId === 'none') return;
    const ctx = this.ensureContext();
    const dest = this.sfxGainNode || ctx.destination;
    scheduleComicSFX(ctx, dest, sfxId, ctx.currentTime);
  }

  public playTrack(trackId: string, customAudioUrl?: string | null, volume = 0.85) {
    this.stop();
    if (trackId === 'none') {
      return;
    }

    const ctx = this.ensureContext();
    this.setVolume(volume);
    this.isPlaying = true;

    if (trackId === 'custom' && customAudioUrl) {
      if (!this.customAudioEl) {
        this.customAudioEl = new Audio();
        this.customAudioEl.crossOrigin = 'anonymous';
      }
      this.customAudioEl.src = customAudioUrl;
      this.customAudioEl.currentTime = 0;
      this.customAudioEl.volume = volume;

      if (!this.customMediaSource && this.destinationNode && this.gainNode) {
        try {
          this.customMediaSource = ctx.createMediaElementSource(this.customAudioEl);
          this.customMediaSource.connect(this.gainNode);
        } catch {
          // May already be connected
        }
      }

      this.customAudioEl.play().catch(() => {});
      return;
    }

    const notes = TRACK_NOTES[trackId] || TRACK_NOTES.lullaby;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(trackId === 'musicbox' ? 4500 : 2600, now);
    filter.Q.setValueAtTime(0.7, now);
    if (this.gainNode) {
      filter.connect(this.gainNode);
    }

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = note.type || 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      const startTime = now + note.time;
      const attack = 0.04;
      const decay = note.duration * 0.4;
      const sustain = note.gain * 0.4;
      const release = note.duration * 0.5;

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(note.gain, startTime + attack);
      noteGain.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.001), startTime + attack + decay);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay + release);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(startTime);
      osc.stop(startTime + attack + decay + release + 0.1);

      this.activeOscillators.push({ osc, gain: noteGain });
    }
  }
}

/**
 * Pure helper function to schedule comic sound effects at specified audio time.
 * Can be used by both the live player and the video exporter.
 */
export function scheduleComicSFX(
  ctx: AudioContext,
  destination: AudioNode,
  sfxId: string,
  startTime: number
) {
  if (sfxId === 'none') return;

  if (sfxId === 'boing') {
    // CLASSIC CARTOON BOING: Pitch sweep upwards with vibrato
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, startTime);
    osc.frequency.exponentialRampToValueAtTime(460, startTime + 0.08);

    // LFO vibrato for the comic spring wobble
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(22, startTime);
    lfoGain.gain.setValueAtTime(28, startTime);
    lfoGain.gain.exponentialRampToValueAtTime(1, startTime + 0.45);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.48);

    osc.connect(gain);
    gain.connect(destination);

    lfo.start(startTime);
    lfo.stop(startTime + 0.5);
    osc.start(startTime);
    osc.stop(startTime + 0.5);

  } else if (sfxId === 'pop') {
    // CARTOON BUBBLE POP: High pitch drop with bandpass resonance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, startTime);
    osc.frequency.exponentialRampToValueAtTime(130, startTime + 0.06);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, startTime);
    filter.Q.setValueAtTime(3.5, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.75, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.1);

  } else if (sfxId === 'applause') {
    // CHEERFUL CELEBRATION APPLAUSE: multiple snappy noise claps
    const clapTimes = [0.0, 0.06, 0.13, 0.19, 0.26, 0.33, 0.4, 0.48];
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    clapTimes.forEach((offset, idx) => {
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + idx * 80, startTime + offset);
      filter.Q.setValueAtTime(2.0, startTime + offset);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime + offset);
      gain.gain.linearRampToValueAtTime(0.35, startTime + offset + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.045);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      whiteNoise.start(startTime + offset);
      whiteNoise.stop(startTime + offset + 0.05);
    });

  } else if (sfxId === 'sparkle') {
    // MAGIC SPARKLE / CHIMES: Rapid glissando of pentatonic bell notes
    const sparkleNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5 to G6
    sparkleNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = startTime + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });

  } else if (sfxId === 'whoosh') {
    // COMIC PANEL WHOOSH: Fast filtered sweep
    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, startTime);
    filter.frequency.exponentialRampToValueAtTime(2400, startTime + 0.12);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + 0.28);
    filter.Q.setValueAtTime(1.8, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.45, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.32);
  }
}
