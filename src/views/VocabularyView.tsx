import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookMarked,
  Layers,
  Sparkles,
  Volume2,
  Check,
  RotateCcw,
  Plus,
  Search,
  Trash2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { VocabularyItem, CefrLevel } from '../types';
import { CEFRBadge } from '../components/CEFRBadge';
import { audioEngine } from '../audio/audioPlayer';
import { storage } from '../core/storage';
import { aiProvider } from '../core/aiProvider';
import { translations, Language } from '../core/i18n';

interface VocabularyViewProps {
  vocabulary: VocabularyItem[];
  dueVocab: VocabularyItem[];
  language: Language;
  onVocabUpdated: () => void;
  initialMode?: 'list' | 'review';
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  vocabulary,
  dueVocab,
  language,
  onVocabUpdated,
  initialMode = 'list',
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'review'>(
    initialMode === 'review' && dueVocab.length > 0 ? 'review' : 'list'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [boxFilter, setBoxFilter] = useState<number | 'ALL'>('ALL');

  // Flashcard review state
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewCompleted, setReviewCompleted] = useState<boolean>(false);

  // Add Word Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const t = translations[language];

  // Box statistics
  const boxCounts = {
    1: vocabulary.filter((v) => v.leitnerBox === 1).length,
    2: vocabulary.filter((v) => v.leitnerBox === 2).length,
    3: vocabulary.filter((v) => v.leitnerBox === 3).length,
    4: vocabulary.filter((v) => v.leitnerBox === 4).length,
    5: vocabulary.filter((v) => v.leitnerBox === 5).length,
  };

  const currentFlashcard = dueVocab[reviewIndex];

  const handleReviewAnswer = async (known: boolean) => {
    if (!currentFlashcard) return;
    await storage.processLeitnerReview(currentFlashcard.id, known);
    setIsFlipped(false);

    if (reviewIndex < dueVocab.length - 1) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setReviewCompleted(true);
    }
    onVocabUpdated();
  };

  const handleDeleteWord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.deleteVocabulary(id);
    onVocabUpdated();
  };

  const handleAddNewWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordInput.trim()) return;

    setLookupLoading(true);
    setLookupError(null);

    try {
      const details = await aiProvider.lookupWord(newWordInput.trim());
      await storage.addVocabulary({
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

      setNewWordInput('');
      setShowAddModal(false);
      onVocabUpdated();
    } catch (err: any) {
      setLookupError(err.message || 'Failed to lookup and add word.');
    } finally {
      setLookupLoading(false);
    }
  };

  const filteredVocabulary = vocabulary.filter((item) => {
    const matchSearch =
      searchQuery === '' ||
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translationFa.includes(searchQuery);
    const matchBox = boxFilter === 'ALL' || item.leitnerBox === boxFilter;
    return matchSearch && matchBox;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 1. Header & Leitner Overview */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
                {t.vocabularyTitle}
              </h1>
              <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark">
                {vocabulary.length} {language === 'fa' ? 'واژه ثبت شده در لایتنر' : 'words in Leitner system'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewWord}</span>
          </button>
        </div>

        {/* 5 Leitner Boxes Progress Visualizer */}
        <div className="grid grid-cols-5 gap-1.5 pt-2">
          {[1, 2, 3, 4, 5].map((box) => (
            <button
              key={box}
              onClick={() => setBoxFilter(boxFilter === box ? 'ALL' : box)}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                boxFilter === box
                  ? 'bg-brand text-white border-brand shadow-xs scale-105'
                  : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border-borderLight dark:border-borderDark hover:border-brand/30'
              }`}
            >
              <div className="text-[10px] font-bold opacity-75">
                Box {box}
              </div>
              <div className="text-base font-black mt-0.5">
                {boxCounts[box as 1 | 2 | 3 | 4 | 5]}
              </div>
            </button>
          ))}
        </div>

        {/* Spaced Review CTA Bar */}
        {dueVocab.length > 0 && viewMode === 'list' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300">
                {dueVocab.length} {t.wordsDueForReview}
              </p>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 mt-0.5">
                {language === 'fa' ? 'تکرار فاصله‌دار برای جلوگیری از فراموشی' : 'Review now to strengthen active recall'}
              </p>
            </div>
            <button
              onClick={() => {
                setViewMode('review');
                setReviewIndex(0);
                setIsFlipped(false);
                setReviewCompleted(false);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs active:scale-95 transition-all whitespace-nowrap"
            >
              {t.startReview}
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. SPACED REPETITION FLASHCARD REVIEW MODE                     */}
      {/* ============================================================== */}
      {viewMode === 'review' && (
        <div className="space-y-4 animate-scale-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('list')}
              className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark"
            >
              ← {language === 'fa' ? 'بازگشت به فهرست واژه‌ها' : 'Back to Word List'}
            </button>
            <span className="text-xs font-mono text-textSecondaryLight dark:text-textSecondaryDark">
              Card {reviewIndex + 1} / {dueVocab.length}
            </span>
          </div>

          {!reviewCompleted && currentFlashcard ? (
            <div className="space-y-4">
              {/* Interactive Flipcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-72 p-6 rounded-3xl bg-surfaceLight dark:bg-surfaceDark border-2 border-borderLight dark:border-borderDark hover:border-brand/40 shadow-md cursor-pointer flex flex-col justify-between transition-all"
              >
                {/* Card Front: English Word & Audio */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-textSecondaryLight dark:text-textSecondaryDark font-mono">
                      Box {currentFlashcard.leitnerBox}
                    </span>
                    {currentFlashcard.cefr && <CEFRBadge level={currentFlashcard.cefr} size="sm" />}
                  </div>

                  <div className="text-center py-8 space-y-2">
                    <h2 className="text-3xl font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
                      {currentFlashcard.word}
                    </h2>
                    {currentFlashcard.ipa && (
                      <p className="text-xs font-mono text-brand dark:text-accent font-semibold">
                        {currentFlashcard.ipa}
                      </p>
                    )}
                    {currentFlashcard.persianPronunciation && (
                      <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark">
                        تلفظ: {currentFlashcard.persianPronunciation}
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioEngine.speakSingleWord(currentFlashcard.word);
                      }}
                      className="p-2.5 rounded-full bg-brand-soft dark:bg-brand-darkSoft text-brand dark:text-accent hover:bg-brand/20 mt-2 mx-auto inline-flex active:scale-90 transition-transform"
                      aria-label="Pronounce"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Card Back: Persian Translation & Context (Hidden until flipped) */}
                <div className="border-t border-borderLight dark:border-borderDark pt-4 text-center">
                  {isFlipped ? (
                    <div className="space-y-2 animate-fade-in">
                      <div className="text-xl font-bold text-brand dark:text-accent">
                        {currentFlashcard.translationFa}
                      </div>
                      {currentFlashcard.exampleEn && (
                        <div className="text-xs text-textSecondaryLight dark:text-textSecondaryDark italic pt-1">
                          "{currentFlashcard.exampleEn}"
                        </div>
                      )}
                      {currentFlashcard.exampleFa && (
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {currentFlashcard.exampleFa}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-textSecondaryLight dark:text-textSecondaryDark font-bold">
                      <Eye className="w-4 h-4" />
                      <span>{t.flipToReveal}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Leitner Answer Actions */}
              {isFlipped && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleReviewAnswer(false)}
                    className="py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.stillLearning} (Box 1)</span>
                  </button>

                  <button
                    onClick={() => handleReviewAnswer(true)}
                    className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.iKnowIt} (+1 Box)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Review Completed Screen */
            <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-8 shadow-sm border border-borderLight dark:border-borderDark text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-textPrimaryLight dark:text-textPrimaryDark">
                {language === 'fa' ? 'مرور کارت‌های امروز کامل شد!' : 'All Flashcards Reviewed!'}
              </h3>
              <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark max-w-sm mx-auto">
                {language === 'fa'
                  ? 'واژگان بر اساس پاسخ‌های شما در جعبه‌های لایتنر جابه‌جا شدند و حافظه فعال شما تقویت شد.'
                  : 'Your spaced repetition schedule has been updated.'}
              </p>
              <button
                onClick={() => setViewMode('list')}
                className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-xs hover:bg-brand-hover transition-all"
              >
                {language === 'fa' ? 'مشاهده بانک لغات' : 'Back to Word List'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VOCABULARY LIST & FILTER VIEW                               */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchVocabPlaceholder}
              className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark text-sm focus:outline-hidden focus:border-brand"
            />
          </div>

          <div className="space-y-2.5">
            {filteredVocabulary.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark hover:border-brand/30 shadow-2xs space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => audioEngine.speakSingleWord(item.word)}
                      className="p-1.5 rounded-lg bg-brand-soft dark:bg-brand-darkSoft text-brand dark:text-accent hover:bg-brand/20 transition-colors"
                      aria-label="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
                      {item.word}
                    </span>
                    {item.cefr && <CEFRBadge level={item.cefr} size="sm" />}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-textSecondaryLight dark:text-textSecondaryDark font-mono">
                      Box {item.leitnerBox}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand dark:text-accent">
                      {item.translationFa}
                    </span>
                    <button
                      onClick={(e) => handleDeleteWord(item.id, e)}
                      className="p-1 rounded-md text-stone-300 hover:text-rose-500 transition-colors"
                      aria-label="Delete word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.exampleEn && (
                  <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark italic leading-relaxed">
                    "{item.exampleEn}"
                  </p>
                )}
                {item.notes && (
                  <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 text-[11px] text-amber-900 dark:text-amber-200/90 leading-tight">
                    💡 {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-md bg-surfaceLight dark:bg-surfaceDark rounded-3xl shadow-2xl border border-borderLight dark:border-borderDark p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand dark:text-accent" />
                <h3 className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
                  {t.addNewWord}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-textSecondaryLight dark:text-textSecondaryDark hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewWordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
                  {language === 'fa' ? 'کلمه انگلیسی مورد نظر را تایپ کنید:' : 'Enter English word:'}
                </label>
                <input
                  type="text"
                  required
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  placeholder="e.g. accomplish, enthusiastic, resilience"
                  className="w-full px-4 py-2.5 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-sm focus:outline-hidden focus:border-brand"
                />
              </div>

              {lookupError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{lookupError}</p>
              )}

              <button
                type="submit"
                disabled={lookupLoading || !newWordInput.trim()}
                className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {lookupLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{language === 'fa' ? 'تحلیل و ترجمه با هوش مصنوعی...' : 'Analyzing & Adding...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{language === 'fa' ? 'افزودن به جعبه لایتنر' : 'Add to Leitner'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
