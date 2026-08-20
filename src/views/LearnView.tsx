import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  BrainCircuit,
  ListOrdered,
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  Volume2,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Check,
  RotateCcw,
} from 'lucide-react';
import { LessonItem, GrammarTopic, IrregularVerb, CefrLevel, AssessmentQuestion, AssessmentResult } from '../types';
import { CEFRBadge } from '../components/CEFRBadge';
import { GRAMMAR_TOPICS } from '../data/grammarTopics';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { GRAMMAR_ASSESSMENT_QUESTIONS } from '../data/grammarAssessment';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { WordBottomSheet } from '../components/WordBottomSheet';
import { audioEngine } from '../audio/audioPlayer';
import { storage } from '../core/storage';
import { translations, Language } from '../core/i18n';

interface LearnViewProps {
  lessons: LessonItem[];
  currentCefr: CefrLevel;
  language: Language;
  onLessonCompleted: (lessonId: string, score: number) => void;
  onAssessmentCompleted: (result: AssessmentResult) => void;
  onGrammarQuizCompleted: (topicId: string, scoreOutOf100: number) => void;
  grammarProgress: Record<string, { masteryScore: number }>;
  initialTab?: 'lessons' | 'grammar' | 'verbs' | 'assessment';
  activeLesson?: LessonItem | null;
  onCloseActiveLesson?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  lessons,
  currentCefr,
  language,
  onLessonCompleted,
  onAssessmentCompleted,
  onGrammarQuizCompleted,
  grammarProgress,
  initialTab = 'lessons',
  activeLesson: propActiveLesson = null,
  onCloseActiveLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'grammar' | 'verbs' | 'assessment'>(initialTab);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader state
  const [currentReadingLesson, setCurrentReadingLesson] = useState<LessonItem | null>(propActiveLesson);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedWordSentence, setSelectedWordSentence] = useState<string | undefined>(undefined);
  const [showPersianTranslations, setShowPersianTranslations] = useState<boolean>(true);

  // Lesson Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Grammar Topic modal
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<GrammarTopic | null>(null);
  const [grammarQuizAnswers, setGrammarQuizAnswers] = useState<Record<number, number>>({});
  const [grammarQuizSubmitted, setGrammarQuizSubmitted] = useState<boolean>(false);
  const [grammarQuizScore, setGrammarQuizScore] = useState<number>(0);

  // Assessment state
  const [assessmentCurrentIdx, setAssessmentCurrentIdx] = useState<number>(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentFinished, setAssessmentFinished] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const t = translations[language];

  // Open a lesson
  const handleOpenLesson = (lesson: LessonItem) => {
    setCurrentReadingLesson(lesson);
    setCurrentSentenceIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleCloseLesson = () => {
    setCurrentReadingLesson(null);
    audioEngine.stop();
    onCloseActiveLesson?.();
  };

  const handleWordClick = (rawWord: string, sentenceEn?: string) => {
    const clean = rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    if (clean) {
      setSelectedWord(clean);
      setSelectedWordSentence(sentenceEn);
    }
  };

  // Submit lesson comprehension quiz
  const handleLessonQuizSubmit = () => {
    if (!currentReadingLesson?.comprehensionQuestions) return;
    const questions = currentReadingLesson.comprehensionQuestions;
    let correctCount = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    onLessonCompleted(currentReadingLesson.id, score);
  };

  // Grammar Quiz Submit
  const handleGrammarQuizSubmit = () => {
    if (!activeGrammarTopic?.quiz) return;
    const questions = activeGrammarTopic.quiz;
    let correctCount = 0;
    questions.forEach((q) => {
      if (grammarQuizAnswers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);
    setGrammarQuizScore(score);
    setGrammarQuizSubmitted(true);
    onGrammarQuizCompleted(activeGrammarTopic.id, score);
  };

  // Diagnostic Assessment Logic
  const handleAssessmentAnswer = (questionId: number, optionIdx: number) => {
    const nextAnswers = { ...assessmentAnswers, [questionId]: optionIdx };
    setAssessmentAnswers(nextAnswers);

    if (assessmentCurrentIdx < GRAMMAR_ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentCurrentIdx(assessmentCurrentIdx + 1);
    } else {
      // Calculate final diagnostic score
      finishAssessment(nextAnswers);
    }
  };

  const finishAssessment = (answers: Record<number, number>) => {
    let score = 0;
    const weak: string[] = [];
    const strong: string[] = [];

    GRAMMAR_ASSESSMENT_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        score += 1;
        strong.push(q.topic);
      } else {
        weak.push(q.topic);
      }
    });

    const percentage = Math.round((score / GRAMMAR_ASSESSMENT_QUESTIONS.length) * 100);

    let estimatedLevel: CefrLevel = 'A1';
    if (percentage >= 85) estimatedLevel = 'C1';
    else if (percentage >= 70) estimatedLevel = 'B2';
    else if (percentage >= 50) estimatedLevel = 'B1';
    else if (percentage >= 30) estimatedLevel = 'A2';
    else estimatedLevel = 'A1';

    const result: AssessmentResult = {
      id: `assessment-${Date.now()}`,
      date: new Date().toISOString(),
      totalQuestions: GRAMMAR_ASSESSMENT_QUESTIONS.length,
      correctCount: score,
      scorePercentage: percentage,
      estimatedLevel,
      weakTopics: weak,
      strongTopics: strong,
    };

    setAssessmentResult(result);
    setAssessmentFinished(true);
    onAssessmentCompleted(result);
  };

  const filteredLessons = lessons.filter((l) => {
    const matchLevel = selectedLevelFilter === 'ALL' || l.cefrLevel === selectedLevelFilter;
    const matchSearch =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.titleFa && l.titleFa.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchSearch;
  });

  const filteredVerbs = IRREGULAR_VERBS.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.base.toLowerCase().includes(q) ||
      v.pastSimple.toLowerCase().includes(q) ||
      v.pastParticiple.toLowerCase().includes(q) ||
      v.meaningFa.includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* 1. Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surfaceElevatedLight dark:bg-surfaceElevatedDark rounded-2xl border border-borderLight dark:border-borderDark overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('lessons');
            setCurrentReadingLesson(null);
          }}
          className={`flex-1 min-w-24 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lessons'
              ? 'bg-surfaceLight dark:bg-surfaceDark text-brand dark:text-accent shadow-xs'
              : 'text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'درس‌ها و داستان' : 'Lessons'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('grammar');
            setCurrentReadingLesson(null);
          }}
          className={`flex-1 min-w-24 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'grammar'
              ? 'bg-surfaceLight dark:bg-surfaceDark text-brand dark:text-accent shadow-xs'
              : 'text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'سرفصل گرامر' : 'Grammar'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('verbs');
            setCurrentReadingLesson(null);
          }}
          className={`flex-1 min-w-24 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'verbs'
              ? 'bg-surfaceLight dark:bg-surfaceDark text-brand dark:text-accent shadow-xs'
              : 'text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'افعال بی‌قاعده' : 'Irregular Verbs'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('assessment');
            setCurrentReadingLesson(null);
          }}
          className={`flex-1 min-w-24 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'assessment'
              ? 'bg-surfaceLight dark:bg-surfaceDark text-brand dark:text-accent shadow-xs'
              : 'text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'fa' ? 'تعیین سطح' : 'Placement'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ACTIVE LESSON READER VIEW                                     */}
      {/* ============================================================== */}
      {currentReadingLesson ? (
        <div className="space-y-6 animate-scale-up">
          {/* Reader Header */}
          <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CEFRBadge level={currentReadingLesson.cefrLevel} size="md" />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-soft dark:bg-brand-darkSoft text-brand dark:text-accent font-bold">
                    {currentReadingLesson.contentType}
                  </span>
                  <span className="text-xs text-textSecondaryLight dark:text-textSecondaryDark font-medium">
                    {currentReadingLesson.topic}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
                  {currentReadingLesson.title}
                </h1>
                {currentReadingLesson.titleFa && (
                  <h2 className="text-base font-bold text-textSecondaryLight dark:text-textSecondaryDark mt-1">
                    {currentReadingLesson.titleFa}
                  </h2>
                )}
              </div>

              <button
                onClick={handleCloseLesson}
                className="p-2 rounded-full hover:bg-surfaceElevatedLight dark:hover:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark transition-colors"
                aria-label="Close lesson"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Translation & Inspector Control Chip */}
            <div className="flex items-center justify-between pt-2 border-t border-borderLight dark:border-borderDark text-xs">
              <span className="text-textSecondaryLight dark:text-textSecondaryDark italic">
                {t.tapWordToInspect}
              </span>
              <button
                onClick={() => setShowPersianTranslations(!showPersianTranslations)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  showPersianTranslations
                    ? 'bg-brand text-white'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark'
                }`}
              >
                {showPersianTranslations ? 'ترجمه فارسی: روشن' : 'ترجمه فارسی: خاموش'}
              </button>
            </div>
          </div>

          {/* Interactive Synchronized Text Body */}
          <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
            <div className="space-y-4">
              {currentReadingLesson.sentences.map((sent, idx) => {
                const isSpoken = currentSentenceIndex === idx;
                const words = sent.en.split(' ');

                return (
                  <div
                    key={sent.id || idx}
                    onClick={() => setCurrentSentenceIndex(idx)}
                    className={`p-4 rounded-2xl transition-all border ${
                      isSpoken
                        ? 'bg-brand-soft/70 dark:bg-brand-darkSoft/60 border-brand shadow-xs ring-2 ring-brand/20'
                        : 'bg-surfaceElevatedLight/50 dark:bg-surfaceElevatedDark/50 border-transparent hover:border-borderLight dark:hover:border-borderDark'
                    }`}
                  >
                    {/* Interactive English Sentence */}
                    <div className="text-base sm:text-lg leading-relaxed text-textPrimaryLight dark:text-textPrimaryDark flex flex-wrap gap-x-1.5 gap-y-1 font-reading">
                      {words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordClick(w, sent.en);
                          }}
                          className="hover:text-brand dark:hover:text-accent hover:underline decoration-brand/50 cursor-pointer rounded-xs px-0.5 transition-colors"
                        >
                          {w}
                        </span>
                      ))}
                    </div>

                    {/* Aligned Persian Translation */}
                    {showPersianTranslations && sent.fa && (
                      <div className="text-xs sm:text-sm text-textSecondaryLight dark:text-textSecondaryDark font-normal leading-relaxed mt-2 pt-2 border-t border-borderLight/60 dark:border-borderDark/60">
                        {sent.fa}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grammar Insight Card for Persian Learners */}
          {currentReadingLesson.grammarTip && (
            <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{currentReadingLesson.grammarTip.titleFa || currentReadingLesson.grammarTip.title}</span>
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                {currentReadingLesson.grammarTip.explanationFa || currentReadingLesson.grammarTip.explanationEn}
              </p>
              {currentReadingLesson.grammarTip.persianLearnerTip && (
                <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                  <strong>نکته کاربردی: </strong>
                  {currentReadingLesson.grammarTip.persianLearnerTip}
                </div>
              )}
            </div>
          )}

          {/* Comprehension Quiz Section */}
          {Boolean(currentReadingLesson.comprehensionQuestions && currentReadingLesson.comprehensionQuestions.length > 0) && (
            <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand dark:text-accent" />
                  <h3 className="text-lg font-black text-textPrimaryLight dark:text-textPrimaryDark">
                    {t.comprehensionQuiz}
                  </h3>
                </div>
                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-brand text-white">
                    Score: {quizScore}%
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {currentReadingLesson.comprehensionQuestions?.map((q, qIdx) => {
                  const selected = quizAnswers[q.id];
                  const isCorrect = selected === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark space-y-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                          {qIdx + 1}. {q.questionEn}
                        </p>
                        {q.questionFa && (
                          <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                            {q.questionFa}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          let optStyle = 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark';
                          if (quizSubmitted) {
                            if (oIdx === q.correctAnswerIndex) {
                              optStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (selected === oIdx) {
                              optStyle = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                            }
                          } else if (selected === oIdx) {
                            optStyle = 'border-brand bg-brand-soft/40 dark:bg-brand-darkSoft text-brand dark:text-accent font-bold ring-2 ring-brand/20';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs leading-normal transition-all ${optStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && q.explanationFa && (
                        <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-textSecondaryLight dark:text-textSecondaryDark">
                          💡 {q.explanationFa}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleLessonQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < (currentReadingLesson.comprehensionQuestions?.length || 0)}
                  className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  {language === 'fa' ? 'ثبت و بررسی پاسخ‌ها' : 'Check Answers'}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                  <p className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    {language === 'fa' ? 'درس با موفقیت تکمیل شد!' : 'Lesson Completed!'}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    +{currentReadingLesson.readingTimeMinutes || 3} min study time recorded to your profile.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sticky Audio Bar for Current Reading */}
          <AudioPlayerBar
            sentences={currentReadingLesson.sentences}
            currentSentenceIndex={currentSentenceIndex}
            onSentenceSelected={(idx) => setCurrentSentenceIndex(idx)}
            language={language}
          />
        </div>
      ) : null}

      {/* ============================================================== */}
      {/* TAB 1: LESSONS & STORIES DIRECTORY                            */}
      {/* ============================================================== */}
      {!currentReadingLesson && activeTab === 'lessons' && (
        <div className="space-y-4">
          {/* Search & Level Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fa' ? 'جستجوی داستان، موضوع...' : 'Search lessons, topics...'}
                className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark text-sm focus:outline-hidden focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedLevelFilter === lvl
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-surfaceLight dark:bg-surfaceDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark hover:border-brand/40'
                  }`}
                >
                  {lvl === 'ALL' ? (language === 'fa' ? 'همه سطوح' : 'All Levels') : `Level ${lvl}`}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Cards List */}
          <div className="space-y-3">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleOpenLesson(lesson)}
                className="p-5 rounded-3xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark hover:border-brand/40 shadow-xs transition-all active:scale-98 cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CEFRBadge level={lesson.cefrLevel} size="sm" />
                    <span className="text-xs font-bold text-brand dark:text-accent">
                      {lesson.contentType}
                    </span>
                    <span className="text-xs text-textSecondaryLight dark:text-textSecondaryDark font-medium">
                      • {lesson.readingTimeMinutes} min
                    </span>
                  </div>
                  {lesson.isCompleted && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === 'fa' ? 'تکمیل شده' : 'Completed'}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
                    {lesson.title}
                  </h3>
                  {lesson.titleFa && (
                    <p className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                      {lesson.titleFa}
                    </p>
                  )}
                  {lesson.summaryFa && (
                    <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark mt-2 leading-relaxed line-clamp-2">
                      {lesson.summaryFa}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-borderLight dark:border-borderDark text-xs text-brand dark:text-accent font-bold">
                  <span>{language === 'fa' ? 'شروع مطالعه و صوت' : 'Read & Listen'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GRAMMAR SYLLABUS                                       */}
      {/* ============================================================== */}
      {!currentReadingLesson && activeTab === 'grammar' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-5 shadow-xs border border-borderLight dark:border-borderDark space-y-1">
            <h2 className="text-lg font-black text-textPrimaryLight dark:text-textPrimaryDark">
              {t.grammarTitle}
            </h2>
            <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
              {t.grammarSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {GRAMMAR_TOPICS.map((topic) => {
              const prog = grammarProgress[topic.id];
              const score = prog?.masteryScore || 0;

              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    setActiveGrammarTopic(topic);
                    setGrammarQuizAnswers({});
                    setGrammarQuizSubmitted(false);
                    setGrammarQuizScore(0);
                  }}
                  className="p-5 rounded-3xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark hover:border-brand/40 shadow-xs cursor-pointer transition-all active:scale-98 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CEFRBadge level={topic.level} size="sm" />
                      <span className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark">
                        {topic.category}
                      </span>
                    </div>

                    {score > 0 ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          score >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {score}% Mastered
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium">Not practiced</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                      {topic.title}
                    </h3>
                    <p className="text-xs font-bold text-brand dark:text-accent mt-0.5">
                      {topic.titleFa}
                    </p>
                    <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark mt-1.5 leading-relaxed">
                      {topic.summaryFa}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-borderLight dark:border-borderDark text-xs font-bold text-brand dark:text-accent">
                    <span>{language === 'fa' ? 'مطالعه درس و حل کوئیز' : 'Open Lesson & Quiz'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grammar Topic Modal */}
      {activeGrammarTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveGrammarTopic(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-lg bg-surfaceLight dark:bg-surfaceDark rounded-3xl shadow-2xl border border-borderLight dark:border-borderDark max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-borderLight dark:border-borderDark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CEFRBadge level={activeGrammarTopic.level} size="sm" />
                <h3 className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
                  {activeGrammarTopic.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveGrammarTopic(null)}
                className="p-1.5 rounded-full hover:bg-surfaceElevatedLight dark:hover:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Detailed Persian Explanation */}
              <div className="p-4 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark space-y-2 text-xs leading-relaxed">
                <div className="font-bold text-sm text-textPrimaryLight dark:text-textPrimaryDark">
                  {activeGrammarTopic.titleFa}
                </div>
                <p className="text-textSecondaryLight dark:text-textSecondaryDark">
                  {activeGrammarTopic.explanationFa}
                </p>
              </div>

              {/* Persian Mistakes Section */}
              {activeGrammarTopic.persianMistakes && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>اشتباه رایج فارسی‌زبانان:</span>
                  </div>
                  <div className="text-xs space-y-1 text-rose-900 dark:text-rose-200">
                    <div className="line-through opacity-75">❌ {activeGrammarTopic.persianMistakes.wrong}</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ {activeGrammarTopic.persianMistakes.correct}
                    </div>
                    <p className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark pt-1">
                      {activeGrammarTopic.persianMistakes.explanationFa}
                    </p>
                  </div>
                </div>
              )}

              {/* Topic Quiz */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-textPrimaryLight dark:text-textPrimaryDark">
                    آزمون تسلط بر مبحث ({activeGrammarTopic.quiz.length} سوال)
                  </h4>
                  {grammarQuizSubmitted && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand text-white">
                      {grammarQuizScore}%
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {activeGrammarTopic.quiz.map((q, idx) => {
                    const selected = grammarQuizAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark space-y-2"
                      >
                        <p className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                          {idx + 1}. {q.question}
                        </p>

                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            let style = 'bg-surfaceLight dark:bg-surfaceDark border-borderLight dark:border-borderDark';
                            if (grammarQuizSubmitted) {
                              if (oIdx === q.correctOptionIndex) {
                                style = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 font-bold text-emerald-800 dark:text-emerald-200';
                              } else if (selected === oIdx) {
                                style = 'bg-rose-100 dark:bg-rose-950 border-rose-500 font-bold text-rose-800 dark:text-rose-200';
                              }
                            } else if (selected === oIdx) {
                              style = 'border-brand bg-brand-soft/40 dark:bg-brand-darkSoft text-brand dark:text-accent font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={grammarQuizSubmitted}
                                onClick={() => setGrammarQuizAnswers({ ...grammarQuizAnswers, [q.id]: oIdx })}
                                className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {grammarQuizSubmitted && q.explanationFa && (
                          <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-textSecondaryLight dark:text-textSecondaryDark">
                            💡 {q.explanationFa}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!grammarQuizSubmitted ? (
                  <button
                    onClick={handleGrammarQuizSubmit}
                    disabled={Object.keys(grammarQuizAnswers).length < activeGrammarTopic.quiz.length}
                    className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                  >
                    ثبت پاسخ‌های کوئیز
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveGrammarTopic(null)}
                    className="w-full py-2.5 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark font-bold text-xs text-textPrimaryLight dark:text-textPrimaryDark"
                  >
                    بستن پنجره
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: IRREGULAR VERBS DIRECTORY                              */}
      {/* ============================================================== */}
      {!currentReadingLesson && activeTab === 'verbs' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-5 shadow-xs border border-borderLight dark:border-borderDark space-y-1">
            <h2 className="text-lg font-black text-textPrimaryLight dark:text-textPrimaryDark">
              {t.irregularVerbs}
            </h2>
            <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
              {t.irregularVerbsSubtitle}
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'fa' ? 'جستجوی فعل انگلیسی یا معنی فارسی...' : 'Search verbs...'}
              className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark text-sm focus:outline-hidden focus:border-brand"
            />
          </div>

          <div className="space-y-2.5">
            {filteredVerbs.map((verb, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => audioEngine.speakSingleWord(verb.base)}
                      className="p-1.5 rounded-lg bg-brand-soft dark:bg-brand-darkSoft text-brand dark:text-accent hover:bg-brand/20 transition-colors"
                      aria-label="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
                      {verb.base}
                    </span>
                    <CEFRBadge level={verb.cefr} size="sm" />
                  </div>
                  <span className="text-xs font-bold text-brand dark:text-accent">
                    {verb.meaningFa}
                  </span>
                </div>

                {/* 3 Forms Table */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-xs text-center font-mono">
                  <div>
                    <div className="text-[10px] text-textSecondaryLight dark:text-textSecondaryDark font-sans font-medium">
                      Base (V1)
                    </div>
                    <div className="font-bold text-textPrimaryLight dark:text-textPrimaryDark">{verb.base}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-textSecondaryLight dark:text-textSecondaryDark font-sans font-medium">
                      Past (V2)
                    </div>
                    <div className="font-bold text-textPrimaryLight dark:text-textPrimaryDark">{verb.pastSimple}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-textSecondaryLight dark:text-textSecondaryDark font-sans font-medium">
                      Participle (V3)
                    </div>
                    <div className="font-bold text-textPrimaryLight dark:text-textPrimaryDark">{verb.pastParticiple}</div>
                  </div>
                </div>

                {verb.phoneticFa && (
                  <div className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark">
                    تلفظ فارسی: <strong className="text-textPrimaryLight dark:text-textPrimaryDark">{verb.phoneticFa}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: DIAGNOSTIC PLACEMENT ASSESSMENT                        */}
      {/* ============================================================== */}
      {!currentReadingLesson && activeTab === 'assessment' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-black text-textPrimaryLight dark:text-textPrimaryDark">
                {t.diagnosticAssessment}
              </h2>
            </div>
            <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
              {t.assessmentSummary}
            </p>
          </div>

          {!assessmentFinished ? (
            <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-5">
              {/* Progress & Level Indicator */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-textSecondaryLight dark:text-textSecondaryDark">
                  Question {assessmentCurrentIdx + 1} of {GRAMMAR_ASSESSMENT_QUESTIONS.length}
                </span>
                <CEFRBadge
                  level={GRAMMAR_ASSESSMENT_QUESTIONS[assessmentCurrentIdx].level}
                  size="sm"
                />
              </div>

              <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{
                    width: `${((assessmentCurrentIdx + 1) / GRAMMAR_ASSESSMENT_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Active Question */}
              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-xs font-bold text-brand dark:text-accent">
                    {GRAMMAR_ASSESSMENT_QUESTIONS[assessmentCurrentIdx].topic}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-textPrimaryLight dark:text-textPrimaryDark mt-1">
                    {GRAMMAR_ASSESSMENT_QUESTIONS[assessmentCurrentIdx].question}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {GRAMMAR_ASSESSMENT_QUESTIONS[assessmentCurrentIdx].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() =>
                        handleAssessmentAnswer(
                          GRAMMAR_ASSESSMENT_QUESTIONS[assessmentCurrentIdx].id,
                          oIdx
                        )
                      }
                      className="w-full text-left p-3.5 rounded-2xl border border-borderLight dark:border-borderDark bg-surfaceElevatedLight dark:bg-surfaceElevatedDark hover:border-brand text-xs sm:text-sm font-medium text-textPrimaryLight dark:text-textPrimaryDark active:scale-98 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Assessment Completed Result Card */
            <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-sm border border-borderLight dark:border-borderDark text-center space-y-5 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Assessment Completed
                </span>
                <h3 className="text-2xl font-black text-textPrimaryLight dark:text-textPrimaryDark mt-1">
                  Calibrated CEFR Level: {assessmentResult?.estimatedLevel}
                </h3>
                <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark mt-1">
                  Score: {assessmentResult?.correctCount} / {assessmentResult?.totalQuestions} ({assessmentResult?.scorePercentage}%)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-xs text-left space-y-2">
                <div className="font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                  🎯 Personalized AI Diagnostics:
                </div>
                <p className="text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
                  Your profile has been calibrated to level <strong>{assessmentResult?.estimatedLevel}</strong>. All AI generated lessons and grammar recommendations will now dynamically adapt to your exact proficiency.
                </p>
              </div>

              <button
                onClick={() => {
                  setAssessmentFinished(false);
                  setAssessmentCurrentIdx(0);
                  setAssessmentAnswers({});
                }}
                className="w-full py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-hover transition-all"
              >
                Retake Placement Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Word Bottom Sheet for Vocabulary Lookup */}
      <WordBottomSheet
        word={selectedWord}
        contextSentence={selectedWordSentence}
        onClose={() => setSelectedWord(null)}
        language={language}
      />
    </div>
  );
};
