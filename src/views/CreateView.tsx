import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Sliders,
  BookMarked,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  Lightbulb,
  Check,
} from 'lucide-react';
import { CefrLevel, LearnerProfile, LessonItem } from '../types';
import { CEFRBadge } from '../components/CEFRBadge';
import { aiProvider, GenerateLessonOptions } from '../core/aiProvider';
import { GRAMMAR_TOPICS } from '../data/grammarTopics';
import { translations, Language } from '../core/i18n';

interface CreateViewProps {
  profile: LearnerProfile;
  language: Language;
  onLessonGenerated: (lesson: LessonItem) => void;
  initialMode?: 'smart' | 'topic' | 'words' | 'custom';
}

export const CreateView: React.FC<CreateViewProps> = ({
  profile,
  language,
  onLessonGenerated,
  initialMode = 'smart',
}) => {
  const [mode, setMode] = useState<'smart' | 'topic' | 'words' | 'custom'>(initialMode);

  // Form State
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel>(profile.currentCefr);
  const [contentType, setContentType] = useState<'Story' | 'Dialogue' | 'Article' | 'News' | 'Diary'>('Story');
  const [topic, setTopic] = useState<string>('Everyday Life & Travel');
  const [grammarFocus, setGrammarFocus] = useState<string>(profile.weakGrammarTopics?.[0] || 'Past Simple vs Present Perfect');
  const [targetWordsInput, setTargetWordsInput] = useState<string>('essential, perspective, remarkable');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Loading & Generation Result state
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedLesson, setGeneratedLesson] = useState<LessonItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[language];

  const topicsList = [
    'Everyday Life & Travel',
    'Persian Heritage & Global Culture',
    'AI, Tech & Modern Future',
    'Job Interviews & Professional English',
    'Food, Dining & Culinary Traditions',
    'Health, Habits & Mindfulness',
    'Nature, Science & Exploration',
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMessage(null);
    setGeneratedLesson(null);

    try {
      let options: GenerateLessonOptions;

      if (mode === 'smart') {
        options = {
          cefrLevel: profile.currentCefr,
          targetCefr: profile.targetCefr,
          contentType: 'Story',
          topic: topic || 'Adaptive English Learning',
          grammarFocus: profile.weakGrammarTopics?.[0] || 'Essential Grammar Structures',
          weakAreas: profile.weakGrammarTopics,
          length: 'medium',
        };
      } else if (mode === 'topic') {
        options = {
          cefrLevel: selectedCefr,
          contentType,
          topic,
          grammarFocus,
          length,
        };
      } else if (mode === 'words') {
        const words = targetWordsInput
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean);
        options = {
          cefrLevel: selectedCefr,
          contentType,
          topic: `Story with Target Vocabulary: ${words.slice(0, 3).join(', ')}`,
          targetWords: words,
          length,
        };
      } else {
        options = {
          cefrLevel: selectedCefr,
          contentType: 'Custom',
          topic: 'Custom Learning Request',
          learnerNotes: customPrompt,
          length,
        };
      }

      const lesson = await aiProvider.generateLesson(options);
      setGeneratedLesson(lesson);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate lesson. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
              {t.aiGeneratorTitle}
            </h1>
            <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
              {t.aiGeneratorSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setMode('smart')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            mode === 'smart'
              ? 'bg-brand text-white border-brand shadow-sm scale-102'
              : 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark text-textPrimaryLight dark:text-textPrimaryDark hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <Sparkles className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/20">
              AI Coach
            </span>
          </div>
          <div>
            <p className="text-xs font-black">{t.modeSmart}</p>
            <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{language === 'fa' ? 'تطبیق با پرونده' : 'Adaptive'}</p>
          </div>
        </button>

        <button
          onClick={() => setMode('topic')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            mode === 'topic'
              ? 'bg-brand text-white border-brand shadow-sm scale-102'
              : 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark text-textPrimaryLight dark:text-textPrimaryDark hover:border-brand/40'
          }`}
        >
          <Sliders className="w-4 h-4 mb-1" />
          <div>
            <p className="text-xs font-black">{t.modeTopic}</p>
            <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{language === 'fa' ? 'انتخاب سطح و موضوع' : 'Custom CEFR'}</p>
          </div>
        </button>

        <button
          onClick={() => setMode('words')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            mode === 'words'
              ? 'bg-brand text-white border-brand shadow-sm scale-102'
              : 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark text-textPrimaryLight dark:text-textPrimaryDark hover:border-brand/40'
          }`}
        >
          <BookMarked className="w-4 h-4 mb-1" />
          <div>
            <p className="text-xs font-black">{t.modeMyWords}</p>
            <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{language === 'fa' ? 'لغات دلخواه من' : 'Word List'}</p>
          </div>
        </button>

        <button
          onClick={() => setMode('custom')}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            mode === 'custom'
              ? 'bg-brand text-white border-brand shadow-sm scale-102'
              : 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark text-textPrimaryLight dark:text-textPrimaryDark hover:border-brand/40'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-1" />
          <div>
            <p className="text-xs font-black">{t.modeCustom}</p>
            <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{language === 'fa' ? 'دستور آزاد' : 'Free Prompt'}</p>
          </div>
        </button>
      </div>

      {/* Generator Configuration Form */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-5">
        {/* Smart Mode Info */}
        {mode === 'smart' && (
          <div className="p-4 rounded-2xl bg-brand-soft/60 dark:bg-brand-darkSoft/40 border border-brand/20 space-y-2">
            <div className="flex items-center gap-2 text-brand dark:text-accent font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'fa' ? 'تنظیمات خودکار مربی هوشمند' : 'AI Adaptive Engine'}</span>
            </div>
            <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
              {language === 'fa'
                ? `درس به صورت کاملاً خودکار برای سطح ${profile.currentCefr} شما و با هدف تسلط بیشتر بر مباحث گرامری نیازمند تقویت (${profile.weakGrammarTopics?.join('، ') || 'افعال گذشته و شرطی‌ها'}) تولید خواهد شد.`
                : `The AI coach will generate a story calibrated to your current ${profile.currentCefr} level targeting weak areas.`}
            </p>
          </div>
        )}

        {/* Level Selector */}
        {mode !== 'smart' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block">
              {language === 'fa' ? 'سطح استاندارد CEFR' : 'Target CEFR Level'}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedCefr(lvl)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedCefr === lvl
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark hover:border-brand/40'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Type Selector */}
        {mode !== 'smart' && mode !== 'custom' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block">
              {language === 'fa' ? 'قالب محتوا' : 'Content Format'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Story', 'Dialogue', 'Article', 'News', 'Diary'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setContentType(fmt)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    contentType === fmt
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark hover:border-brand/40'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic Input or Selector */}
        {mode !== 'custom' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block">
              {language === 'fa' ? 'موضوع درس' : 'Lesson Topic'}
            </label>
            <div className="relative">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs font-medium text-textPrimaryLight dark:text-textPrimaryDark focus:outline-hidden focus:border-brand appearance-none"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Target Words Input for "words" mode */}
        {mode === 'words' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block">
              {language === 'fa' ? 'کلمات هدف (با کاما جدا کنید)' : 'Target Words (Comma-separated)'}
            </label>
            <input
              type="text"
              value={targetWordsInput}
              onChange={(e) => setTargetWordsInput(e.target.value)}
              placeholder="e.g. delicious, remarkable, persistent, negotiate"
              className="w-full px-4 py-2.5 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs font-medium focus:outline-hidden focus:border-brand"
            />
          </div>
        )}

        {/* Custom Prompt Input for "custom" mode */}
        {mode === 'custom' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block">
              {language === 'fa' ? 'درخواست ویژه شما از مربی هوش مصنوعی' : 'Custom Prompt for AI Coach'}
            </label>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={
                language === 'fa'
                  ? 'مثال: یک مکالمه بین مسافر ایرانی و مامور مهاجرت فرودگاه هیترو لندن بنویس که در آن سوالات متداول و اصطلاحات مودبانه انگلیسی به همراه ترجمه باشد.'
                  : 'e.g. Write an IELTS speaking conversation about Iranian traditional architecture...'
              }
              className="w-full p-4 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs font-medium focus:outline-hidden focus:border-brand"
            />
          </div>
        )}

        {/* Generate Action Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t.generatingLesson}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t.generateButton}</span>
            </>
          )}
        </button>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Generated Lesson Preview Card */}
      {generatedLesson && (
        <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-md border-2 border-brand/30 space-y-4 animate-scale-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Ready
                </span>
                <CEFRBadge level={generatedLesson.cefrLevel} size="sm" />
                <span className="text-xs font-bold text-brand dark:text-accent">
                  {generatedLesson.contentType}
                </span>
              </div>
              <h3 className="text-xl font-black text-textPrimaryLight dark:text-textPrimaryDark">
                {generatedLesson.title}
              </h3>
              {generatedLesson.titleFa && (
                <p className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                  {generatedLesson.titleFa}
                </p>
              )}
            </div>
          </div>

          {generatedLesson.levelAnalysis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-[11px]">
              <div>
                <span className="text-stone-400 block">Level Matched:</span>
                <strong className="text-textPrimaryLight dark:text-textPrimaryDark">
                  {generatedLesson.levelAnalysis.estimatedCefr}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Readability:</span>
                <strong className="text-textPrimaryLight dark:text-textPrimaryDark">
                  {generatedLesson.levelAnalysis.readabilityScore}/100
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Vocabulary:</span>
                <strong className="text-textPrimaryLight dark:text-textPrimaryDark">
                  {generatedLesson.levelAnalysis.vocabularyComplexity}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Sentences:</span>
                <strong className="text-textPrimaryLight dark:text-textPrimaryDark">
                  {generatedLesson.sentences.length} lines
                </strong>
              </div>
            </div>
          )}

          <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark line-clamp-3 leading-relaxed">
            {generatedLesson.text}
          </p>

          <button
            onClick={() => onLessonGenerated(generatedLesson)}
            className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>{language === 'fa' ? 'ورود به محیط مطالعه تعاملی و پخش صوت' : 'Open in Interactive Reader & Audio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
