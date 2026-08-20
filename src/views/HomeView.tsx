import React from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  BookMarked,
  BrainCircuit,
  Clock,
  Award,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { LearnerProfile, DailyMission, VocabularyItem, LessonItem, GrammarProgress } from '../types';
import { CEFRBadge } from '../components/CEFRBadge';
import { generateRecommendations, RecommendationAction } from '../learning/recommendationEngine';
import { translations, Language } from '../core/i18n';
import { NavTab } from '../components/Navbar';

interface HomeViewProps {
  profile: LearnerProfile;
  dailyMission: DailyMission;
  dueVocab: VocabularyItem[];
  lessons: LessonItem[];
  grammarProgress: Record<string, GrammarProgress>;
  language: Language;
  onNavigate: (tab: NavTab, actionData?: any) => void;
  onStartLesson: (lesson: LessonItem) => void;
  onStartGrammarTopic: (topicId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  dailyMission,
  dueVocab,
  lessons,
  grammarProgress,
  language,
  onNavigate,
  onStartLesson,
  onStartGrammarTopic,
}) => {
  const t = translations[language];

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  const recommendations = generateRecommendations(
    profile,
    dueVocab,
    lessons,
    dailyMission,
    grammarProgress
  );

  const topRec = recommendations[0];

  const handleExecuteRecommendation = (rec: RecommendationAction) => {
    if (rec.type === 'review_vocab') {
      onNavigate('vocabulary', { mode: 'review' });
    } else if (rec.type === 'grammar_practice') {
      onStartGrammarTopic(rec.dataPayload.topicId);
    } else if (rec.type === 'read_lesson') {
      onStartLesson(rec.dataPayload.lesson);
    } else if (rec.type === 'generate_smart_lesson') {
      onNavigate('create', { mode: 'smart' });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Hero Learner Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-sm border border-borderLight dark:border-borderDark">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 dark:bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-brand dark:text-accent tracking-wide uppercase">
                {getGreeting()}
              </p>
              <h1 className="text-2xl font-black tracking-tight text-textPrimaryLight dark:text-textPrimaryDark mt-0.5">
                {profile.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <CEFRBadge level={profile.currentCefr} size="lg" showLabel />
              <span className="text-xs text-textSecondaryLight dark:text-textSecondaryDark font-bold">
                →
              </span>
              <CEFRBadge level={profile.targetCefr} size="md" />
            </div>
          </div>

          {/* Mini Study Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                <Flame className="w-4 h-4 fill-amber-500" />
                <span>{profile.streakDays}</span>
              </div>
              <span className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark font-medium mt-0.5">
                {language === 'fa' ? 'روز تداوم' : 'Day Streak'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-brand dark:text-accent font-bold text-lg">
                <Clock className="w-4 h-4" />
                <span>{profile.studyTimeTodayMinutes || 0}m</span>
              </div>
              <span className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark font-medium mt-0.5">
                {language === 'fa' ? 'مطالعه امروز' : 'Today'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                <BookMarked className="w-4 h-4" />
                <span>{profile.vocabularyMasteredCount}</span>
              </div>
              <span className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark font-medium mt-0.5">
                {language === 'fa' ? 'واژه لایتنر' : 'Mastered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top AI Recommendation Action Card */}
      {topRec && (
        <div className="rounded-3xl bg-brand dark:bg-brand-darkSoft p-5 text-white shadow-md relative overflow-hidden group">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent">
                {language === 'fa' ? 'پیشنهاد هوش مصنوعی' : 'AI Recommendation'}
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
              {language === 'fa' ? topRec.badgeFa : topRec.badgeEn}
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight mt-1">
            {language === 'fa' ? topRec.titleFa : topRec.titleEn}
          </h3>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            {language === 'fa' ? topRec.subtitleFa : topRec.subtitleEn}
          </p>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{topRec.estimatedMinutes} {t.readingTime}</span>
            </div>

            <button
              onClick={() => handleExecuteRecommendation(topRec)}
              className="px-4 py-2 rounded-xl bg-white text-brand dark:text-brand-dark font-extrabold text-xs shadow-sm hover:bg-white/95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>{language === 'fa' ? 'شروع کن' : 'Start Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Today's Mission Checklist */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-5 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
              {t.todaysMission}
            </h2>
          </div>
          {dailyMission.allCompleted && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Completed!
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {/* Mission 1: Review Vocab */}
          <div
            onClick={() => onNavigate('vocabulary', { mode: 'review' })}
            className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
              dailyMission.reviewVocab.completed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border-borderLight dark:border-borderDark hover:border-brand/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {dailyMission.reviewVocab.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                  {t.missionReviewVocab}
                </p>
                <p className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                  {dailyMission.reviewVocab.current} / {dailyMission.reviewVocab.target} words
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-textSecondaryLight dark:text-textSecondaryDark" />
          </div>

          {/* Mission 2: Read Story */}
          <div
            onClick={() => onNavigate('learn')}
            className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
              dailyMission.readStory.completed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border-borderLight dark:border-borderDark hover:border-brand/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {dailyMission.readStory.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                  {t.missionReadStory}
                </p>
                <p className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                  {dailyMission.readStory.current} / {dailyMission.readStory.target} completed
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-textSecondaryLight dark:text-textSecondaryDark" />
          </div>

          {/* Mission 3: Practice Grammar */}
          <div
            onClick={() => onNavigate('learn', { tab: 'grammar' })}
            className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
              dailyMission.practiceGrammar.completed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border-borderLight dark:border-borderDark hover:border-brand/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {dailyMission.practiceGrammar.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                  {t.missionPracticeGrammar}
                </p>
                <p className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark mt-0.5">
                  {dailyMission.practiceGrammar.current} / {dailyMission.practiceGrammar.target} quiz
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-textSecondaryLight dark:text-textSecondaryDark" />
          </div>
        </div>
      </div>

      {/* 4. Skill Mastery Progress Grid */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-5 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-textPrimaryLight dark:text-textPrimaryDark">
            {t.yourSkills}
          </h2>
          <span className="text-xs font-bold text-brand dark:text-accent">
            {profile.currentCefr} Progression
          </span>
        </div>

        <div className="space-y-3">
          {/* Vocabulary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-textPrimaryLight dark:text-textPrimaryDark flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {t.skillVocabulary}
              </span>
              <span className="text-teal-700 dark:text-teal-300">{profile.skillLevels.vocabulary}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.skillLevels.vocabulary}%` }}
              />
            </div>
          </div>

          {/* Grammar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-textPrimaryLight dark:text-textPrimaryDark flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {t.skillGrammar}
              </span>
              <span className="text-indigo-700 dark:text-indigo-300">{profile.skillLevels.grammar}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.skillLevels.grammar}%` }}
              />
            </div>
          </div>

          {/* Reading */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-textPrimaryLight dark:text-textPrimaryDark flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t.skillReading}
              </span>
              <span className="text-emerald-700 dark:text-emerald-300">{profile.skillLevels.reading}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.skillLevels.reading}%` }}
              />
            </div>
          </div>

          {/* Listening */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-textPrimaryLight dark:text-textPrimaryDark flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {t.skillListening}
              </span>
              <span className="text-amber-700 dark:text-amber-300">{profile.skillLevels.listening}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.skillLevels.listening}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
