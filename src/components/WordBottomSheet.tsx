import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Plus, Check, X, Sparkles, BookOpen, ExternalLink, Lightbulb } from 'lucide-react';
import { CefrLevel, VocabularyItem } from '../types';
import { CEFRBadge } from './CEFRBadge';
import { audioEngine } from '../audio/audioPlayer';
import { aiProvider, WordLookupResult } from '../core/aiProvider';
import { storage } from '../core/storage';
import { translations, Language } from '../core/i18n';

interface WordBottomSheetProps {
  word: string | null;
  contextSentence?: string;
  onClose: () => void;
  language: Language;
  onAddedToVocab?: (item: VocabularyItem) => void;
}

export const WordBottomSheet: React.FC<WordBottomSheetProps> = ({
  word,
  contextSentence,
  onClose,
  language,
  onAddedToVocab,
}) => {
  const [details, setDetails] = useState<WordLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingItem, setExistingItem] = useState<VocabularyItem | null>(null);
  const [adding, setAdding] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (!word) {
      setDetails(null);
      setExistingItem(null);
      return;
    }

    const cleanWord = word.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    let isMounted = true;

    async function fetchWord() {
      setLoading(true);
      // Check if already in user vocabulary
      const allVocab = await storage.getAllVocabulary();
      const found = allVocab.find((v) => v.word.toLowerCase() === cleanWord.toLowerCase());
      if (isMounted) {
        setExistingItem(found || null);
      }

      const res = await aiProvider.lookupWord(cleanWord, contextSentence);
      if (isMounted) {
        setDetails(res);
        setLoading(false);
      }
    }

    fetchWord();

    return () => {
      isMounted = false;
    };
  }, [word, contextSentence]);

  if (!word) return null;

  const handleSpeak = () => {
    if (word) {
      audioEngine.speakSingleWord(word);
    }
  };

  const handleAddToVocab = async () => {
    if (!details || existingItem || adding) return;
    setAdding(true);
    try {
      const added = await storage.addVocabulary({
        word: details.word,
        ipa: details.ipa,
        persianPronunciation: details.persianPronunciation,
        partOfSpeech: details.partOfSpeech,
        cefr: details.cefr,
        definitionEn: details.definitionEn,
        translationFa: details.translationFa,
        alternativeTranslationsFa: details.alternativeTranslationsFa,
        exampleEn: details.examples?.[0]?.en || '',
        exampleFa: details.examples?.[0]?.fa || '',
        notes: details.persianLearnerTip,
      });
      setExistingItem(added);
      onAddedToVocab?.(added);
    } catch (e) {
      console.error('Failed to add vocab:', e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Sheet Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg bg-surfaceLight dark:bg-surfaceDark rounded-t-3xl sm:rounded-3xl shadow-2xl border border-borderLight dark:border-borderDark max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header Drag handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>

          <div className="p-5 overflow-y-auto space-y-4">
            {/* Top Bar with Word, Audio & Close */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-2xl font-black tracking-tight text-textPrimaryLight dark:text-textPrimaryDark">
                    {details?.word || word}
                  </h3>
                  {details?.cefr && <CEFRBadge level={details.cefr} size="sm" />}
                  {details?.partOfSpeech && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-textSecondaryLight dark:text-textSecondaryDark font-mono">
                      {details.partOfSpeech}
                    </span>
                  )}
                </div>

                {/* IPA & Persian Phonetic Guide */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-textSecondaryLight dark:text-textSecondaryDark">
                  {details?.ipa && <span className="font-mono text-brand dark:text-accent font-semibold">{details.ipa}</span>}
                  {details?.persianPronunciation && (
                    <span className="text-stone-500 dark:text-stone-400">
                      تلفظ: <strong className="text-textPrimaryLight dark:text-textPrimaryDark">{details.persianPronunciation}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeak}
                  className="p-2.5 rounded-full bg-brand-soft dark:bg-brand-darkSoft hover:bg-brand/20 text-brand dark:text-accent transition-all active:scale-90"
                  aria-label="Pronounce word"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-textSecondaryLight dark:text-textSecondaryDark transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-textSecondaryLight dark:text-textSecondaryDark">
                <Sparkles className="w-6 h-6 animate-spin text-brand dark:text-accent" />
                <span className="text-xs">Analyzing word with AI Coach...</span>
              </div>
            ) : details ? (
              <div className="space-y-3.5">
                {/* Primary Persian Translation Card */}
                <div className="p-3.5 rounded-2xl bg-brand-soft/50 dark:bg-brand-darkSoft/40 border border-brand/20">
                  <div className="text-xs text-brand dark:text-accent font-bold mb-1">
                    معنی فارسی
                  </div>
                  <div className="text-lg font-bold text-textPrimaryLight dark:text-textPrimaryDark leading-relaxed">
                    {details.translationFa}
                  </div>
                  {Boolean(details.alternativeTranslationsFa && details.alternativeTranslationsFa.length > 0) && (
                    <div className="mt-1.5 text-xs text-textSecondaryLight dark:text-textSecondaryDark">
                      معانی دیگر: {details.alternativeTranslationsFa.join('، ')}
                    </div>
                  )}
                </div>

                {/* English Definition */}
                {details.definitionEn && (
                  <div className="p-3 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-xs leading-relaxed text-textSecondaryLight dark:text-textSecondaryDark">
                    <strong className="text-textPrimaryLight dark:text-textPrimaryDark">Definition: </strong>
                    {details.definitionEn}
                  </div>
                )}

                {/* Examples */}
                {Boolean(details.examples && details.examples.length > 0) && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark">
                      مثال‌های کاربردی:
                    </div>
                    {details.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark space-y-1 text-xs"
                      >
                        <p className="font-medium text-textPrimaryLight dark:text-textPrimaryDark">{ex.en}</p>
                        <p className="text-textSecondaryLight dark:text-textSecondaryDark text-[11px] leading-normal">{ex.fa}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Persian Learner Tip */}
                {details.persianLearnerTip && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800 dark:text-amber-300">نکته طلایی برای ایرانیان: </span>
                      <span className="text-amber-900 dark:text-amber-200/90 leading-relaxed">{details.persianLearnerTip}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border-t border-borderLight dark:border-borderDark flex items-center justify-between gap-3 safe-bottom">
            {existingItem ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                <span>
                  {t.alreadyInVocabulary.replace('{box}', String(existingItem.leitnerBox))}
                </span>
              </div>
            ) : (
              <button
                onClick={handleAddToVocab}
                disabled={loading || adding}
                className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addToVocabulary}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
