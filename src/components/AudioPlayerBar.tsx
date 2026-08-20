import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, Gauge } from 'lucide-react';
import { audioEngine, AudioState } from '../audio/audioPlayer';
import { SentenceItem } from '../types';
import { translations, Language } from '../core/i18n';

interface AudioPlayerBarProps {
  sentences: SentenceItem[];
  currentSentenceIndex: number;
  onSentenceSelected: (index: number) => void;
  language: Language;
  onAudioProgressRecorded?: (minutes: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  sentences,
  currentSentenceIndex,
  onSentenceSelected,
  language,
  onAudioProgressRecorded,
}) => {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [speed, setSpeed] = useState<number>(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    audioEngine.loadSentences(sentences);
    const unsubscribe = audioEngine.subscribe({
      onStateChange: (state) => setAudioState(state),
      onSentenceChange: (idx) => {
        onSentenceSelected(idx);
      },
      onComplete: () => {
        onAudioProgressRecorded?.(1);
      },
    });

    return () => {
      unsubscribe();
      audioEngine.stop();
    };
  }, [sentences]);

  const handlePlayPause = () => {
    if (audioState === 'playing') {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleSpeedSelect = (newSpeed: number) => {
    setSpeed(newSpeed);
    audioEngine.setPlaybackRate(newSpeed);
    setShowSpeedMenu(false);
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      audioEngine.seekToSentence(currentSentenceIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSentenceIndex > 0) {
      audioEngine.seekToSentence(currentSentenceIndex - 1);
    }
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const progressPercent =
    sentences.length > 0 ? Math.round(((currentSentenceIndex + 1) / sentences.length) * 100) : 0;

  return (
    <div className="sticky bottom-16 left-0 right-0 z-30 bg-surfaceLight/95 dark:bg-surfaceDark/95 backdrop-blur-md border-t border-borderLight dark:border-borderDark px-4 py-3 shadow-lg">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Progress Bar & Sentence Counter */}
        <div className="flex items-center justify-between text-xs text-textSecondaryLight dark:text-textSecondaryDark font-mono">
          <div className="flex items-center gap-1.5 font-sans">
            <Volume2 className="w-3.5 h-3.5 text-brand dark:text-accent" />
            <span>
              Sentence {currentSentenceIndex + 1} of {sentences.length}
            </span>
          </div>
          <span>{progressPercent}%</span>
        </div>

        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand dark:bg-accent h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Speed Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surfaceElevatedLight dark:bg-surfaceElevatedDark hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark border border-borderLight dark:border-borderDark transition-colors"
            >
              <Gauge className="w-3.5 h-3.5 text-brand dark:text-accent" />
              <span>{speed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark rounded-xl shadow-xl p-1 flex flex-col min-w-24 z-50">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedSelect(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                      speed === s
                        ? 'bg-brand text-white'
                        : 'text-textPrimaryLight dark:text-textPrimaryDark hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {s}x {s === 1.0 ? '(Normal)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Playback Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentSentenceIndex === 0}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-textPrimaryLight dark:text-textPrimaryDark transition-colors"
              aria-label="Previous sentence"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-brand hover:bg-brand-hover text-white shadow-md transition-all active:scale-95 flex items-center justify-center"
              aria-label={audioState === 'playing' ? t.pauseAudio : t.playAudio}
            >
              {audioState === 'playing' ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentSentenceIndex >= sentences.length - 1}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-textPrimaryLight dark:text-textPrimaryDark transition-colors"
              aria-label="Next sentence"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-textSecondaryLight dark:text-textSecondaryDark transition-colors"
            aria-label={t.stopAudio}
            title={t.stopAudio}
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
