export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LearnerProfile {
  id: string;
  name: string;
  currentCefr: CefrLevel;
  targetCefr: CefrLevel;
  streakDays: number;
  lastStudyDate: string;
  dailyGoalMinutes: number;
  studyTimeTodayMinutes: number;
  totalStudyTimeMinutes: number;
  vocabularyMasteredCount: number;
  grammarMasteredCount: number;
  lessonsCompletedCount: number;
  weakGrammarTopics: string[];
  strongGrammarTopics: string[];
  skillLevels: {
    vocabulary: number; // 0 - 100
    grammar: number;
    reading: number;
    listening: number;
  };
  learningPreferences: {
    topicInterests: string[];
    difficultyPace: 'relaxed' | 'balanced' | 'intensive';
    nativeLanguage: 'fa';
  };
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  persianPronunciation: string;
  partOfSpeech: string;
  cefr: CefrLevel;
  definitionEn: string;
  translationFa: string;
  alternativeTranslationsFa?: string[];
  exampleEn: string;
  exampleFa: string;
  leitnerBox: 1 | 2 | 3 | 4 | 5;
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  timesCorrect: number;
  timesIncorrect: number;
  addedDate: string;
  sourceLessonId?: string;
  masteryScore: number; // 0 - 100
  notes?: string;
}

export interface SentenceItem {
  id: number;
  en: string;
  fa: string;
}

export interface ComprehensionQuestion {
  id: number;
  questionEn: string;
  questionFa: string;
  options: string[];
  correctAnswerIndex: number;
  explanationFa: string;
  userAnswerIndex?: number;
}

export interface LessonGrammarTip {
  title: string;
  titleFa: string;
  explanationEn: string;
  explanationFa: string;
  persianLearnerTip: string;
  example: string;
}

export interface LevelAnalysis {
  estimatedCefr: CefrLevel | string;
  matchTarget?: boolean;
  vocabularyComplexity: string;
  grammarComplexity: string;
  readabilityScore: number;
  feedbackNoteFa: string;
}

export interface LessonItem {
  id: string;
  title: string;
  titleFa: string;
  cefrLevel: CefrLevel;
  contentType: 'Story' | 'Dialogue' | 'Article' | 'News' | 'Diary' | 'Conversation' | 'Custom';
  topic: string;
  readingTimeMinutes: number;
  summaryFa: string;
  text: string;
  sentences: SentenceItem[];
  vocabulary: Array<{
    word: string;
    ipa: string;
    persianPronunciation: string;
    partOfSpeech: string;
    cefr: CefrLevel | string;
    definitionEn: string;
    translationFa: string;
    exampleEn: string;
    exampleFa: string;
  }>;
  grammarTip?: LessonGrammarTip;
  comprehensionQuestions: ComprehensionQuestion[];
  levelAnalysis?: LevelAnalysis;
  createdAt: string;
  isFavorite?: boolean;
  isCompleted?: boolean;
  completedAt?: string;
  score?: number;
}

export interface GrammarQuizQuestion {
  id: string;
  question: string;
  questionFa?: string;
  options: string[];
  correctIndex: number;
  explanationFa: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleFa: string;
  level: CefrLevel;
  category: 'Verbs & Tenses' | 'Modals & Conditionals' | 'Sentence Structure' | 'Nouns & Modifiers' | 'Advanced Syntax';
  summaryEn: string;
  summaryFa: string;
  structure: string;
  explanationEn: string;
  explanationFa: string;
  persianSpeakerPitfalls: Array<{
    wrong: string;
    correct: string;
    noteFa: string;
  }>;
  examples: Array<{
    en: string;
    fa: string;
    highlight?: string;
  }>;
  quiz: GrammarQuizQuestion[];
}

export interface GrammarProgress {
  topicId: string;
  masteryScore: number; // 0 - 100
  quizzesAttempted: number;
  quizzesPassed: number;
  lastPracticedDate: string;
}

export interface AssessmentQuestion {
  id: number;
  level: CefrLevel;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationFa: string;
}

export interface AssessmentResult {
  id: string;
  date: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  estimatedLevel: CefrLevel;
  weakTopics: string[];
  strongTopics: string[];
  details?: Array<{
    questionId: number;
    level: CefrLevel;
    topic: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}

export interface IrregularVerb {
  base: string;
  pastSimple: string;
  pastParticiple: string;
  meaningFa: string;
  phoneticFa: string;
  cefr: CefrLevel;
  exampleEn: string;
  exampleFa: string;
}

export interface DailyMission {
  date: string; // YYYY-MM-DD
  reviewVocab: { target: number; current: number; completed: boolean };
  readStory: { target: number; current: number; completed: boolean };
  practiceGrammar: { target: number; current: number; completed: boolean };
  listenMinutes: { target: number; current: number; completed: boolean };
  allCompleted: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fa';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontPreference: 'sans' | 'display';
  highlightMode: 'sentence' | 'word' | 'none';
  audioSpeed: number; // 0.75, 1, 1.25, 1.5, 2
  voicePreferred: string;
  aiProvider: 'server' | 'custom_gemini' | 'puter' | 'offline';
  customApiKey?: string;
}

export interface HistoryItem {
  id: string;
  type: 'lesson' | 'grammar' | 'review' | 'assessment' | 'generator';
  title: string;
  titleFa: string;
  level?: CefrLevel | string;
  timestamp: string;
  score?: number;
  durationSeconds?: number;
}

export interface BackupData {
  app: 'English+';
  backupVersion: number;
  createdAt: string;
  data: {
    profile: LearnerProfile;
    settings: AppSettings;
    vocabulary: VocabularyItem[];
    grammarProgress: Record<string, GrammarProgress>;
    assessments: AssessmentResult[];
    lessons: LessonItem[];
    dailyMission: DailyMission;
    history: HistoryItem[];
  };
}
