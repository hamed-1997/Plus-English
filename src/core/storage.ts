import { db, DEFAULT_PROFILE, DEFAULT_SETTINGS, getDefaultDailyMission, getTodayDateString } from './database';
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

export const storage = {
  // PROFILE
  async getProfile(): Promise<LearnerProfile> {
    const profile = await db.get<LearnerProfile>('profile', 'learner-me');
    return profile || DEFAULT_PROFILE;
  },

  async updateProfile(updates: Partial<LearnerProfile>): Promise<LearnerProfile> {
    const current = await this.getProfile();
    const updated: LearnerProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.put('profile', updated);
    return updated;
  },

  async recordStudySession(minutes: number, skillType?: 'vocabulary' | 'grammar' | 'reading' | 'listening'): Promise<LearnerProfile> {
    const profile = await this.getProfile();
    const today = getTodayDateString();
    let newStreak = profile.streakDays;

    if (profile.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (profile.lastStudyDate !== today) {
        newStreak = 1;
      }
    }

    const updatedSkills = { ...profile.skillLevels };
    if (skillType) {
      updatedSkills[skillType] = Math.min(100, Math.round(updatedSkills[skillType] + minutes * 0.4));
    }

    const updated = await this.updateProfile({
      streakDays: newStreak,
      lastStudyDate: today,
      studyTimeTodayMinutes: (profile.studyTimeTodayMinutes || 0) + minutes,
      totalStudyTimeMinutes: (profile.totalStudyTimeMinutes || 0) + minutes,
      skillLevels: updatedSkills,
    });

    return updated;
  },

  // SETTINGS
  async getSettings(): Promise<AppSettings> {
    const record = await db.get<{ id: string } & AppSettings>('settings', 'app-settings');
    if (!record) return DEFAULT_SETTINGS;
    const { id, ...settings } = record;
    return settings;
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = { ...current, ...updates };
    await db.put('settings', { id: 'app-settings', ...updated });
    return updated;
  },

  // VOCABULARY & LEITNER
  async getAllVocabulary(): Promise<VocabularyItem[]> {
    return db.getAll<VocabularyItem>('vocabulary');
  },

  async getVocabularyById(id: string): Promise<VocabularyItem | null> {
    return db.get<VocabularyItem>('vocabulary', id);
  },

  async saveVocabulary(item: VocabularyItem): Promise<void> {
    await db.put('vocabulary', item);
  },

  async addVocabulary(newWord: Omit<VocabularyItem, 'id' | 'addedDate' | 'leitnerBox' | 'nextReviewDate' | 'timesCorrect' | 'timesIncorrect' | 'masteryScore'>): Promise<VocabularyItem> {
    const item: VocabularyItem = {
      ...newWord,
      id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      leitnerBox: 1,
      nextReviewDate: new Date().toISOString(),
      timesCorrect: 0,
      timesIncorrect: 0,
      masteryScore: 10,
      addedDate: new Date().toISOString(),
    };
    await db.put('vocabulary', item);

    // Update profile stats
    const profile = await this.getProfile();
    const allVocab = await this.getAllVocabulary();
    const vocabMastered = allVocab.filter((v) => v.leitnerBox >= 4).length;
    await this.updateProfile({
      vocabularyMasteredCount: vocabMastered,
      skillLevels: {
        ...profile.skillLevels,
        vocabulary: Math.min(100, Math.round(profile.skillLevels.vocabulary + 1)),
      },
    });

    return item;
  },

  async deleteVocabulary(id: string): Promise<void> {
    await db.delete('vocabulary', id);
  },

  async getDueVocabularyReviews(): Promise<VocabularyItem[]> {
    const all = await this.getAllVocabulary();
    const now = new Date();
    return all.filter((item) => new Date(item.nextReviewDate) <= now);
  },

  async processLeitnerReview(id: string, known: boolean): Promise<VocabularyItem> {
    const item = await this.getVocabularyById(id);
    if (!item) throw new Error('Vocabulary item not found');

    const now = new Date();
    let newBox = item.leitnerBox;
    let newTimesCorrect = item.timesCorrect;
    let newTimesIncorrect = item.timesIncorrect;

    // Leitner intervals:
    // Box 1 -> 1 day
    // Box 2 -> 3 days
    // Box 3 -> 7 days
    // Box 4 -> 14 days
    // Box 5 -> 30 days
    const intervalDaysByBox: Record<number, number> = {
      1: 1,
      2: 3,
      3: 7,
      4: 14,
      5: 30,
    };

    if (known) {
      newBox = Math.min(5, item.leitnerBox + 1) as 1 | 2 | 3 | 4 | 5;
      newTimesCorrect += 1;
    } else {
      newBox = 1; // reset to box 1 on mistake
      newTimesIncorrect += 1;
    }

    const intervalDays = intervalDaysByBox[newBox] || 1;
    const nextDate = new Date(now.getTime() + intervalDays * 86400000);

    const updatedItem: VocabularyItem = {
      ...item,
      leitnerBox: newBox,
      nextReviewDate: nextDate.toISOString(),
      lastReviewedDate: now.toISOString(),
      timesCorrect: newTimesCorrect,
      timesIncorrect: newTimesIncorrect,
      masteryScore: Math.round((newBox / 5) * 100),
    };

    await db.put('vocabulary', updatedItem);
    await this.incrementDailyMissionItem('reviewVocab');

    return updatedItem;
  },

  // GRAMMAR PROGRESS
  async getAllGrammarProgress(): Promise<Record<string, GrammarProgress>> {
    const items = await db.getAll<GrammarProgress>('grammarProgress');
    const map: Record<string, GrammarProgress> = {};
    items.forEach((item) => {
      map[item.topicId] = item;
    });
    return map;
  },

  async recordGrammarQuizScore(topicId: string, scoreOutOf100: number): Promise<GrammarProgress> {
    const existing = await db.get<GrammarProgress>('grammarProgress', topicId);
    const progress: GrammarProgress = {
      topicId,
      masteryScore: existing ? Math.max(existing.masteryScore, scoreOutOf100) : scoreOutOf100,
      quizzesAttempted: (existing?.quizzesAttempted || 0) + 1,
      quizzesPassed: (existing?.quizzesPassed || 0) + (scoreOutOf100 >= 70 ? 1 : 0),
      lastPracticedDate: new Date().toISOString(),
    };
    await db.put('grammarProgress', progress);

    // Update profile grammar mastery
    const allProgress = await this.getAllGrammarProgress();
    const masteredCount = Object.values(allProgress).filter((p: GrammarProgress) => p.masteryScore >= 75).length;
    const profile = await this.getProfile();
    await this.updateProfile({
      grammarMasteredCount: masteredCount,
      skillLevels: {
        ...profile.skillLevels,
        grammar: Math.min(100, Math.round(profile.skillLevels.grammar + (scoreOutOf100 >= 70 ? 3 : 1))),
      },
    });

    await this.incrementDailyMissionItem('practiceGrammar');
    return progress;
  },

  // ASSESSMENTS
  async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    await db.put('assessments', result);
    await this.updateProfile({
      currentCefr: result.estimatedLevel,
      weakGrammarTopics: result.weakTopics,
      strongGrammarTopics: result.strongTopics,
      skillLevels: {
        ...(await this.getProfile()).skillLevels,
        grammar: result.scorePercentage,
      },
    });

    await this.addHistoryItem({
      id: `history-${Date.now()}`,
      type: 'assessment',
      title: `Grammar Placement Diagnostic: ${result.estimatedLevel}`,
      titleFa: `آزمون تعیین سطح گرامر: سطح ${result.estimatedLevel}`,
      level: result.estimatedLevel,
      timestamp: result.date,
      score: result.scorePercentage,
    });
  },

  async getLatestAssessment(): Promise<AssessmentResult | null> {
    const all = await db.getAll<AssessmentResult>('assessments');
    if (all.length === 0) return null;
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  // LESSONS
  async getAllLessons(): Promise<LessonItem[]> {
    return db.getAll<LessonItem>('lessons');
  },

  async getLessonById(id: string): Promise<LessonItem | null> {
    return db.get<LessonItem>('lessons', id);
  },

  async saveLesson(lesson: LessonItem): Promise<void> {
    await db.put('lessons', lesson);
  },

  async toggleLessonFavorite(id: string): Promise<boolean> {
    const lesson = await this.getLessonById(id);
    if (!lesson) return false;
    const updated = { ...lesson, isFavorite: !lesson.isFavorite };
    await db.put('lessons', updated);
    return Boolean(updated.isFavorite);
  },

  async completeLesson(id: string, score?: number): Promise<void> {
    const lesson = await this.getLessonById(id);
    if (!lesson) return;
    const updated = {
      ...lesson,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      score: score || 100,
    };
    await db.put('lessons', updated);

    const profile = await this.getProfile();
    await this.updateProfile({
      lessonsCompletedCount: (profile.lessonsCompletedCount || 0) + 1,
      skillLevels: {
        ...profile.skillLevels,
        reading: Math.min(100, profile.skillLevels.reading + 2),
      },
    });

    await this.incrementDailyMissionItem('readStory');
    await this.recordStudySession(lesson.readingTimeMinutes || 3, 'reading');
  },

  // DAILY MISSION
  async getDailyMission(): Promise<DailyMission> {
    const today = getTodayDateString();
    let mission = await db.get<DailyMission>('dailyMission', today);
    if (!mission) {
      mission = {
        date: today,
        reviewVocab: { target: 10, current: 0, completed: false },
        readStory: { target: 1, current: 0, completed: false },
        practiceGrammar: { target: 1, current: 0, completed: false },
        listenMinutes: { target: 3, current: 0, completed: false },
        allCompleted: false,
      };
      await db.put('dailyMission', mission);
    }
    return mission;
  },

  async incrementDailyMissionItem(key: 'reviewVocab' | 'readStory' | 'practiceGrammar' | 'listenMinutes', amount = 1): Promise<DailyMission> {
    const mission = await this.getDailyMission();
    const item = mission[key];
    const newCurrent = item.current + amount;
    const isCompleted = newCurrent >= item.target;

    const updated: DailyMission = {
      ...mission,
      [key]: {
        ...item,
        current: newCurrent,
        completed: isCompleted,
      },
    };

    updated.allCompleted =
      updated.reviewVocab.completed &&
      updated.readStory.completed &&
      updated.practiceGrammar.completed &&
      updated.listenMinutes.completed;

    await db.put('dailyMission', updated);
    return updated;
  },

  // HISTORY
  async getAllHistory(): Promise<HistoryItem[]> {
    const items = await db.getAll<HistoryItem>('history');
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async addHistoryItem(item: HistoryItem): Promise<void> {
    await db.put('history', item);
  },

  // BACKUP & RESTORE
  async exportBackup(): Promise<string> {
    const [profile, settings, vocabulary, grammarProgress, assessments, lessons, dailyMission, history] = await Promise.all([
      this.getProfile(),
      this.getSettings(),
      this.getAllVocabulary(),
      this.getAllGrammarProgress(),
      db.getAll<AssessmentResult>('assessments'),
      this.getAllLessons(),
      this.getDailyMission(),
      this.getAllHistory(),
    ]);

    const backup: BackupData = {
      app: 'English+',
      backupVersion: 1,
      createdAt: new Date().toISOString(),
      data: {
        profile,
        settings,
        vocabulary,
        grammarProgress,
        assessments,
        lessons,
        dailyMission,
        history,
      },
    };

    return JSON.stringify(backup, null, 2);
  },

  async importBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString) as BackupData;
      if (!parsed || parsed.app !== 'English+' || !parsed.data) {
        return { success: false, message: 'Invalid backup file format for English+.' };
      }

      const { data } = parsed;

      if (data.profile) {
        await db.put('profile', data.profile);
      }
      if (data.settings) {
        await db.put('settings', { id: 'app-settings', ...data.settings });
      }
      if (Array.isArray(data.vocabulary)) {
        await db.clear('vocabulary');
        for (const item of data.vocabulary) {
          await db.put('vocabulary', item);
        }
      }
      if (data.grammarProgress) {
        await db.clear('grammarProgress');
        for (const [topicId, prog] of Object.entries(data.grammarProgress)) {
          await db.put('grammarProgress', prog);
        }
      }
      if (Array.isArray(data.assessments)) {
        await db.clear('assessments');
        for (const item of data.assessments) {
          await db.put('assessments', item);
        }
      }
      if (Array.isArray(data.lessons)) {
        await db.clear('lessons');
        for (const item of data.lessons) {
          await db.put('lessons', item);
        }
      }
      if (data.dailyMission) {
        await db.put('dailyMission', data.dailyMission);
      }
      if (Array.isArray(data.history)) {
        await db.clear('history');
        for (const item of data.history) {
          await db.put('history', item);
        }
      }

      return { success: true, message: 'Backup restored successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to parse backup JSON.' };
    }
  },
};
