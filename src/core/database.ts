import {
  LearnerProfile,
  AppSettings,
  VocabularyItem,
  GrammarProgress,
  AssessmentResult,
  LessonItem,
  DailyMission,
  HistoryItem,
  BackupData,
} from '../types';
import { INITIAL_VOCABULARY } from '../data/initialVocabulary';
import { CURATED_LESSONS } from '../data/curatedLessons';

const DB_NAME = 'EnglishPlusDB';
const DB_VERSION = 1;

export const DEFAULT_PROFILE: LearnerProfile = {
  id: 'learner-me',
  name: 'Learner',
  currentCefr: 'A2',
  targetCefr: 'B2',
  streakDays: 4,
  lastStudyDate: new Date().toISOString().split('T')[0],
  dailyGoalMinutes: 15,
  studyTimeTodayMinutes: 8,
  totalStudyTimeMinutes: 190,
  vocabularyMasteredCount: 14,
  grammarMasteredCount: 6,
  lessonsCompletedCount: 3,
  weakGrammarTopics: ['past-simple-irregular-verbs', 'conditionals-zero-first-second-third'],
  strongGrammarTopics: ['present-simple-vs-continuous'],
  skillLevels: {
    vocabulary: 68,
    grammar: 62,
    reading: 74,
    listening: 54,
  },
  learningPreferences: {
    topicInterests: ['Everyday Life', 'Travel', 'Technology', 'Culture'],
    difficultyPace: 'balanced',
    nativeLanguage: 'fa',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'fa',
  fontSize: 'md',
  fontPreference: 'sans',
  highlightMode: 'sentence',
  audioSpeed: 1.0,
  voicePreferred: 'en-US',
  aiProvider: 'server',
};

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDefaultDailyMission(): DailyMission {
  return {
    date: getTodayDateString(),
    reviewVocab: { target: 10, current: 4, completed: false },
    readStory: { target: 1, current: 1, completed: true },
    practiceGrammar: { target: 1, current: 0, completed: false },
    listenMinutes: { target: 3, current: 2, completed: false },
    allCompleted: false,
  };
}

class EnglishPlusDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vocabulary')) {
          const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
          vocabStore.createIndex('leitnerBox', 'leitnerBox', { unique: false });
          vocabStore.createIndex('nextReviewDate', 'nextReviewDate', { unique: false });
          vocabStore.createIndex('word', 'word', { unique: true });
        }
        if (!db.objectStoreNames.contains('grammarProgress')) {
          db.createObjectStore('grammarProgress', { keyPath: 'topicId' });
        }
        if (!db.objectStoreNames.contains('assessments')) {
          db.createObjectStore('assessments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('createdAt', 'createdAt', { unique: false });
          lessonStore.createIndex('cefrLevel', 'cefrLevel', { unique: false });
        }
        if (!db.objectStoreNames.contains('dailyMission')) {
          db.createObjectStore('dailyMission', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        await this.seedInitialDataIfEmpty(db);
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async seedInitialDataIfEmpty(db: IDBDatabase): Promise<void> {
    // Seed profile
    const profileTx = db.transaction('profile', 'readonly');
    const profileReq = profileTx.objectStore('profile').get('learner-me');
    profileReq.onsuccess = () => {
      if (!profileReq.result) {
        const writeTx = db.transaction('profile', 'readwrite');
        writeTx.objectStore('profile').put(DEFAULT_PROFILE);
      }
    };

    // Seed settings
    const settingsTx = db.transaction('settings', 'readonly');
    const settingsReq = settingsTx.objectStore('settings').get('app-settings');
    settingsReq.onsuccess = () => {
      if (!settingsReq.result) {
        const writeTx = db.transaction('settings', 'readwrite');
        writeTx.objectStore('settings').put({ id: 'app-settings', ...DEFAULT_SETTINGS });
      }
    };

    // Seed vocabulary
    const vocabTx = db.transaction('vocabulary', 'readonly');
    const vocabCountReq = vocabTx.objectStore('vocabulary').count();
    vocabCountReq.onsuccess = () => {
      if (vocabCountReq.result === 0) {
        const writeTx = db.transaction('vocabulary', 'readwrite');
        const store = writeTx.objectStore('vocabulary');
        INITIAL_VOCABULARY.forEach((item) => store.put(item));
      }
    };

    // Seed lessons
    const lessonsTx = db.transaction('lessons', 'readonly');
    const lessonsCountReq = lessonsTx.objectStore('lessons').count();
    lessonsCountReq.onsuccess = () => {
      if (lessonsCountReq.result === 0) {
        const writeTx = db.transaction('lessons', 'readwrite');
        const store = writeTx.objectStore('lessons');
        CURATED_LESSONS.forEach((lesson) => store.put(lesson));
      }
    };

    // Seed daily mission
    const today = getTodayDateString();
    const missionTx = db.transaction('dailyMission', 'readonly');
    const missionReq = missionTx.objectStore('dailyMission').get(today);
    missionReq.onsuccess = () => {
      if (!missionReq.result) {
        const writeTx = db.transaction('dailyMission', 'readwrite');
        writeTx.objectStore('dailyMission').put(getDefaultDailyMission());
      }
    };
  }

  // Generic helpers
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const db = new EnglishPlusDatabase();
