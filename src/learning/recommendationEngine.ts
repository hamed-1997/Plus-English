import { LearnerProfile, VocabularyItem, LessonItem, DailyMission, GrammarTopic } from '../types';
import { GRAMMAR_TOPICS } from '../data/grammarTopics';

export interface RecommendationAction {
  id: string;
  type: 'review_vocab' | 'grammar_practice' | 'read_lesson' | 'generate_smart_lesson' | 'assessment';
  priority: 'high' | 'medium' | 'low';
  titleEn: string;
  titleFa: string;
  subtitleEn: string;
  subtitleFa: string;
  badgeEn: string;
  badgeFa: string;
  estimatedMinutes: number;
  dataPayload?: any;
}

export function generateRecommendations(
  profile: LearnerProfile,
  dueVocab: VocabularyItem[],
  lessons: LessonItem[],
  mission: DailyMission,
  grammarProgress: Record<string, { masteryScore: number }>
): RecommendationAction[] {
  const recommendations: RecommendationAction[] = [];

  // 1. Spaced Repetition Due Reviews
  if (dueVocab.length > 0) {
    recommendations.push({
      id: 'rec-vocab-review',
      type: 'review_vocab',
      priority: 'high',
      titleEn: `Review ${dueVocab.length} Spaced Words`,
      titleFa: `مرور ${dueVocab.length} واژه لایتنر`,
      subtitleEn: 'Strengthen active recall before memory decay',
      subtitleFa: 'تثبیت واژگان در حافظه بلندمدت با جعبه لایتنر',
      badgeEn: `${dueVocab.length} Due`,
      badgeFa: `${dueVocab.length} واژه آماده`,
      estimatedMinutes: Math.max(2, Math.min(10, Math.ceil(dueVocab.length * 0.4))),
      dataPayload: { count: dueVocab.length },
    });
  }

  // 2. Weak Grammar Focus
  const weakTopics = profile.weakGrammarTopics || [];
  let targetGrammar = GRAMMAR_TOPICS.find((t) => weakTopics.includes(t.id));

  // If no explicit weak topic, find lowest score or unpracticed
  if (!targetGrammar) {
    targetGrammar = GRAMMAR_TOPICS.find((t) => {
      const prog = grammarProgress[t.id];
      return !prog || prog.masteryScore < 60;
    }) || GRAMMAR_TOPICS[0];
  }

  if (targetGrammar) {
    const currentScore = grammarProgress[targetGrammar.id]?.masteryScore || 0;
    recommendations.push({
      id: `rec-grammar-${targetGrammar.id}`,
      type: 'grammar_practice',
      priority: currentScore < 50 ? 'high' : 'medium',
      titleEn: `Master ${targetGrammar.title}`,
      titleFa: `تسلط بر ${targetGrammar.titleFa}`,
      subtitleEn: `Key focus for ${targetGrammar.level} CEFR progression`,
      subtitleFa: `مبحث گرامری کلیدی با بررسی اشتباهات رایج فارسی‌زبانان`,
      badgeEn: currentScore > 0 ? `Mastery ${currentScore}%` : 'Unpracticed',
      badgeFa: currentScore > 0 ? `تسلط ${currentScore}٪` : 'تمرین‌نشده',
      estimatedMinutes: 5,
      dataPayload: { topicId: targetGrammar.id, topic: targetGrammar },
    });
  }

  // 3. Recommended Reading / Listening Lesson
  const uncompletedLesson = lessons.find((l) => !l.isCompleted && l.cefrLevel === profile.currentCefr) || lessons[0];
  if (uncompletedLesson) {
    recommendations.push({
      id: `rec-lesson-${uncompletedLesson.id}`,
      type: 'read_lesson',
      priority: 'medium',
      titleEn: `Read: ${uncompletedLesson.title}`,
      titleFa: `مطالعه: ${uncompletedLesson.titleFa || uncompletedLesson.title}`,
      subtitleEn: `${uncompletedLesson.cefrLevel} • ${uncompletedLesson.contentType} • ${uncompletedLesson.readingTimeMinutes} min`,
      subtitleFa: `سطح ${uncompletedLesson.cefrLevel} با قابلیت کلیک روی واژگان و صوت همگام`,
      badgeEn: `${uncompletedLesson.cefrLevel} Level`,
      badgeFa: `سطح ${uncompletedLesson.cefrLevel}`,
      estimatedMinutes: uncompletedLesson.readingTimeMinutes || 4,
      dataPayload: { lessonId: uncompletedLesson.id, lesson: uncompletedLesson },
    });
  }

  // 4. Smart AI Tailored Generation
  recommendations.push({
    id: 'rec-smart-generate',
    type: 'generate_smart_lesson',
    priority: 'medium',
    titleEn: 'Create AI Smart Lesson',
    titleFa: 'تولید درس هوشمند با هوش مصنوعی',
    subtitleEn: `Personalized for ${profile.currentCefr} → ${profile.targetCefr} targeting weak areas`,
    subtitleFa: `شخصی‌سازی شده بر اساس سطح ${profile.currentCefr} و نیازمندی‌های یادگیری شما`,
    badgeEn: 'AI Coach',
    badgeFa: 'هوش مصنوعی',
    estimatedMinutes: 6,
    dataPayload: {
      cefr: profile.currentCefr,
      targetCefr: profile.targetCefr,
      weakTopic: targetGrammar?.title,
    },
  });

  return recommendations;
}
