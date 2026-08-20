import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { CreateView } from './views/CreateView';
import { VocabularyView } from './views/VocabularyView';
import { MoreView } from './views/MoreView';
import { storage } from './core/storage';
import {
  LearnerProfile,
  AppSettings,
  VocabularyItem,
  LessonItem,
  DailyMission,
  GrammarProgress,
  AssessmentResult,
} from './types';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, getDefaultDailyMission } from './core/database';
import { Language } from './core/i18n';

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [tabActionData, setTabActionData] = useState<any>(null);

  // App State
  const [profile, setProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [dueVocab, setDueVocab] = useState<VocabularyItem[]>([]);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [dailyMission, setDailyMission] = useState<DailyMission>(getDefaultDailyMission());
  const [grammarProgress, setGrammarProgress] = useState<Record<string, GrammarProgress>>({});

  // Active lesson in reader
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Toast trigger helper
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load from IndexedDB
  const refreshAppData = async () => {
    try {
      const [
        loadedProfile,
        loadedSettings,
        loadedVocab,
        loadedDueVocab,
        loadedLessons,
        loadedMission,
        loadedGrammarProgress,
      ] = await Promise.all([
        storage.getProfile(),
        storage.getSettings(),
        storage.getAllVocabulary(),
        storage.getDueVocabularyReviews(),
        storage.getAllLessons(),
        storage.getDailyMission(),
        storage.getAllGrammarProgress(),
      ]);

      setProfile(loadedProfile);
      setSettings(loadedSettings);
      setVocabulary(loadedVocab);
      setDueVocab(loadedDueVocab);
      setLessons(loadedLessons);
      setDailyMission(loadedMission);
      setGrammarProgress(loadedGrammarProgress);
    } catch (err) {
      console.error('Error loading initial app data from storage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAppData();

    // Offline / Online listeners
    const handleOnline = () => {
      setIsOffline(false);
      addToast('Back online! AI Coach connected.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      addToast('Offline mode active. Using local flashcards & lessons.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme & Language Synchronization with HTML Document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (settings.language === 'fa') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'fa');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
    }
  }, [settings.theme, settings.language]);

  const handleToggleLanguage = async () => {
    const newLang: Language = settings.language === 'fa' ? 'en' : 'fa';
    const updated = await storage.updateSettings({ language: newLang });
    setSettings(updated);
  };

  const handleTabChange = (tab: NavTab, actionData?: any) => {
    setCurrentTab(tab);
    setTabActionData(actionData || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLesson = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setCurrentTab('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGrammarTopic = (topicId: string) => {
    setCurrentTab('learn');
    setTabActionData({ tab: 'grammar', topicId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLessonGenerated = (lesson: LessonItem) => {
    setLessons((prev) => [lesson, ...prev]);
    setActiveLesson(lesson);
    setCurrentTab('learn');
    addToast('Lesson ready! Open in interactive reader.', 'success');
  };

  const handleLessonCompleted = async (lessonId: string, score: number) => {
    await storage.completeLesson(lessonId, score);
    await refreshAppData();
    addToast(`Great job! Lesson completed with ${score}% score.`, 'success');
  };

  const handleAssessmentCompleted = async (result: AssessmentResult) => {
    await storage.saveAssessmentResult(result);
    await refreshAppData();
    addToast(`Placement diagnostics completed: Level ${result.estimatedLevel}!`, 'success');
  };

  const handleGrammarQuizCompleted = async (topicId: string, scoreOutOf100: number) => {
    await storage.recordGrammarQuizScore(topicId, scoreOutOf100);
    await refreshAppData();
    addToast(`Grammar quiz submitted! Score: ${scoreOutOf100}%`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight dark:bg-bgDark flex flex-col items-center justify-center gap-4 text-brand dark:text-accent">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white font-black text-2xl animate-pulse shadow-lg">
          E+
        </div>
        <p className="text-xs font-bold text-textSecondaryLight dark:text-textSecondaryDark tracking-wider uppercase">
          Initializing English+ Coach...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark text-textPrimaryLight dark:text-textPrimaryDark transition-colors flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Mobile-First Header */}
      <Header
        profile={profile}
        settings={settings}
        onToggleLanguage={handleToggleLanguage}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4">
        {currentTab === 'home' && (
          <HomeView
            profile={profile}
            dailyMission={dailyMission}
            dueVocab={dueVocab}
            lessons={lessons}
            grammarProgress={grammarProgress}
            language={settings.language}
            onNavigate={handleTabChange}
            onStartLesson={handleStartLesson}
            onStartGrammarTopic={handleStartGrammarTopic}
          />
        )}

        {currentTab === 'learn' && (
          <LearnView
            lessons={lessons}
            currentCefr={profile.currentCefr}
            language={settings.language}
            onLessonCompleted={handleLessonCompleted}
            onAssessmentCompleted={handleAssessmentCompleted}
            onGrammarQuizCompleted={handleGrammarQuizCompleted}
            grammarProgress={grammarProgress}
            initialTab={tabActionData?.tab || 'lessons'}
            activeLesson={activeLesson}
            onCloseActiveLesson={() => setActiveLesson(null)}
          />
        )}

        {currentTab === 'create' && (
          <CreateView
            profile={profile}
            language={settings.language}
            onLessonGenerated={handleLessonGenerated}
            initialMode={tabActionData?.mode || 'smart'}
          />
        )}

        {currentTab === 'vocabulary' && (
          <VocabularyView
            vocabulary={vocabulary}
            dueVocab={dueVocab}
            language={settings.language}
            onVocabUpdated={refreshAppData}
            initialMode={tabActionData?.mode || 'list'}
          />
        )}

        {currentTab === 'more' && (
          <MoreView
            settings={settings}
            profile={profile}
            language={settings.language}
            onSettingsUpdated={setSettings}
            onProfileUpdated={setProfile}
            onToast={addToast}
          />
        )}
      </main>

      {/* Bottom Sticky Mobile Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => handleTabChange(tab)}
        language={settings.language}
        dueVocabCount={dueVocab.length}
      />
    </div>
  );
}

export default App;
