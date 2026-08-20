import { SentenceItem } from '../types';

export type AudioState = 'idle' | 'playing' | 'paused' | 'stopped';

export interface AudioPlayerListener {
  onStateChange?: (state: AudioState) => void;
  onSentenceChange?: (sentenceIndex: number, sentence: SentenceItem | null) => void;
  onProgress?: (progressPercent: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

class EnglishPlusAudioEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private sentences: SentenceItem[] = [];
  private currentSentenceIndex = 0;
  private state: AudioState = 'idle';
  private playbackRate = 1.0;
  private listeners: Set<AudioPlayerListener> = new Set();
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural English voices
    const enVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;
    this.selectedVoice = enVoice;
  }

  public subscribe(listener: AudioPlayerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyState(state: AudioState): void {
    this.state = state;
    this.listeners.forEach((l) => l.onStateChange?.(state));
  }

  private notifySentence(index: number): void {
    this.currentSentenceIndex = index;
    const item = this.sentences[index] || null;
    const progress = this.sentences.length > 0 ? Math.round(((index + 1) / this.sentences.length) * 100) : 0;
    this.listeners.forEach((l) => {
      l.onSentenceChange?.(index, item);
      l.onProgress?.(progress);
    });
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    if (this.state === 'playing') {
      // Restart current sentence with new rate
      this.speakSentence(this.currentSentenceIndex);
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getState(): AudioState {
    return this.state;
  }

  public getCurrentSentenceIndex(): number {
    return this.currentSentenceIndex;
  }

  public loadSentences(sentences: SentenceItem[]): void {
    this.stop();
    this.sentences = sentences;
    this.currentSentenceIndex = 0;
  }

  public play(): void {
    if (!this.synth || this.sentences.length === 0) return;

    if (this.state === 'paused' && this.synth.paused) {
      this.synth.resume();
      this.notifyState('playing');
      return;
    }

    this.speakSentence(this.currentSentenceIndex);
  }

  public pause(): void {
    if (!this.synth) return;
    if (this.synth.speaking) {
      this.synth.pause();
      this.notifyState('paused');
    }
  }

  public stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentSentenceIndex = 0;
    this.notifyState('stopped');
    this.notifySentence(0);
  }

  public seekToSentence(index: number): void {
    if (index < 0 || index >= this.sentences.length) return;
    const wasPlaying = this.state === 'playing';
    this.stop();
    this.currentSentenceIndex = index;
    this.notifySentence(index);
    if (wasPlaying) {
      this.speakSentence(index);
    }
  }

  private speakSentence(index: number): void {
    if (!this.synth || index >= this.sentences.length) {
      this.notifyState('idle');
      this.listeners.forEach((l) => l.onComplete?.());
      return;
    }

    this.synth.cancel();
    const sentence = this.sentences[index];
    this.currentSentenceIndex = index;
    this.notifySentence(index);
    this.notifyState('playing');

    const utterance = new SpeechSynthesisUtterance(sentence.en);
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      if (this.state === 'playing') {
        if (index + 1 < this.sentences.length) {
          setTimeout(() => this.speakSentence(index + 1), 300);
        } else {
          this.notifyState('idle');
          this.listeners.forEach((l) => l.onComplete?.());
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('TTS utterance error:', e);
      if (this.state === 'playing') {
        this.notifyState('idle');
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public speakSingleWord(word: string): void {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    this.synth.speak(utterance);
  }
}

export const audioEngine = new EnglishPlusAudioEngine();
