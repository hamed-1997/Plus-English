import { GrammarTopic } from '../types';

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'present-simple-vs-continuous',
    title: 'Present Simple vs Present Continuous',
    titleFa: 'حال ساده در برابر حال استمراری',
    level: 'A1',
    category: 'Verbs & Tenses',
    summaryEn: 'Distinguish between daily habits/general truths and actions happening right now or temporary situations.',
    summaryFa: 'تفاوت بین عادات روزمره/حقایق کلی با کارهایی که هم‌اکنون در حال انجام هستند یا موقعیت‌های موقت.',
    structure: 'Present Simple: S + V(s/es) | Present Continuous: S + am/is/are + V-ing',
    explanationEn: `Use the Present Simple for habits, routines, facts, and permanent situations (e.g. "I drink tea every morning").
Use the Present Continuous for actions happening at the moment of speaking or temporary states (e.g. "I am drinking tea right now").
Watch out for Stative Verbs (like love, want, know, understand, believe, need) which are NOT normally used in Continuous forms.`,
    explanationFa: `در زبان فارسی گاهی از فعل مضارع هم برای کار در حال انجام («دارم می‌نویسم») و هم برای عادت («هر روز می‌نویسم») استفاده می‌کنیم. اما در انگلیسی تفکیک این دو ضروری است:
۱. حال ساده (Present Simple): برای تکرار، عادات و قوانین علمی به کار می‌رود.
۲. حال استمراری (Present Continuous): برای کارهایی که در همین لحظه جریان دارند یا موقتی هستند.
نکته مهم: افعال حالتی (Stative Verbs) مثل know, want, like در حالت استمراری (-ing) به کار نمی‌روند. به عنوان مثال نگویید "I am knowing you".`,
    persianSpeakerPitfalls: [
      {
        wrong: 'I am knowing the answer.',
        correct: 'I know the answer.',
        noteFa: 'فعل know حالتی است و نباید ing بگیرد.'
      },
      {
        wrong: 'I live here since two years.',
        correct: 'I have lived here for two years.',
        noteFa: 'برای بیان مدتی که کاری از گذشته تا کنون ادامه دارد، از حال کامل استفاده کنید نه حال ساده.'
      },
      {
        wrong: 'Look! It rains.',
        correct: 'Look! It is raining.',
        noteFa: 'اتفاقاتی که در همین لحظه رخ می‌دهند به حال استمراری نیاز دارند.'
      }
    ],
    examples: [
      { en: 'I usually drink Persian black tea with cardamom.', fa: 'من معمولاً چای سیاه ایرانی با هل می‌نوشم.', highlight: 'usually drink' },
      { en: 'Right now, she is preparing for the IELTS exam.', fa: 'همین الان، او در حال آماده شدن برای آزمون آیلتس است.', highlight: 'is preparing' },
      { en: 'Water boils at 100 degrees Celsius.', fa: 'آب در دمای ۱۰۰ درجه سانتی‌گراد می‌جوشد.', highlight: 'boils' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Listen! Someone _______ the piano beautifully.',
        questionFa: 'گوش کن! یک نفر دارد پیانو می‌نوازد.',
        options: ['plays', 'is playing', 'play', 'are playing'],
        correctIndex: 1,
        explanationFa: 'به دلیل کلمه Listen (در همین لحظه)، از حال استمراری (is playing) استفاده می‌شود.'
      },
      {
        id: 'q2',
        question: 'My brother _______ in a software company in Tehran.',
        questionFa: 'برادرم در یک شرکت نرم‌افزاری در تهران کار می‌کند (شغل و وضعیت دائمی).',
        options: ['work', 'works', 'is working', 'working'],
        correctIndex: 1,
        explanationFa: 'برای شغل و وضعیت‌های کاری پایدار از حال ساده با s سوم شخص (works) استفاده می‌شود.'
      },
      {
        id: 'q3',
        question: 'I _______ what you mean.',
        options: ['am understanding', 'understand', 'understands', 'am understand'],
        correctIndex: 1,
        explanationFa: 'فعل understand حالتی (Stative) است و فرم Continuous به خود نمی‌گیرد.'
      }
    ]
  },
  {
    id: 'past-simple-irregular-verbs',
    title: 'Past Simple & Irregular Verbs',
    titleFa: 'گذشته ساده و افعال بی‌قاعده',
    level: 'A2',
    category: 'Verbs & Tenses',
    summaryEn: 'Express completed actions in the past with specific time markers (yesterday, last week, ago).',
    summaryFa: 'بیان کارهای پایان‌یافته در گذشته با نشانه‌های زمانی مشخص (دیروز، هفته گذشته، قبل).',
    structure: 'Affirmative: S + V2 (ed / irregular) | Negative: S + did not (didn\'t) + V1 | Question: Did + S + V1 ?',
    explanationEn: `Use the Past Simple for finished actions that happened at a specific past time.
For regular verbs add -ed (played, watched). For irregular verbs use their specific V2 form (went, saw, bought, took).
Crucial Rule: In negatives and questions, "did / didn't" already carries the past tense, so the main verb returns to its Base Form (V1).`,
    explanationFa: `برای کارهایی که در گذشته در یک زمان معین انجام شده و تمام شده‌اند استفاده می‌شود.
برای افعال باقاعده پسوند -ed اضافه می‌کنیم، اما افعال بی‌قاعده شکل گذشته مخصوص به خود دارند (go -> went, see -> saw).
یک اشتباه بسیار رایج فارسی‌زبانان: پس از didn't یا در سوال با Did، فعل اصلی حتماً باید به شکل ساده (V1) برگردد:
به عنوان مثال نگویید: "I didn't went" بلکه بگویید: "I didn't go".`,
    persianSpeakerPitfalls: [
      {
        wrong: 'I didn\'t went to university yesterday.',
        correct: 'I didn\'t go to university yesterday.',
        noteFa: 'وقتی didn\'t می‌آید، فعل بعد از آن حتماً باید ساده (go) باشد.'
      },
      {
        wrong: 'Did you saw that movie?',
        correct: 'Did you see that movie?',
        noteFa: 'در سوالات با Did، فعل اصلی به صورت ساده (see) می‌آید.'
      },
      {
        wrong: 'I was go to Isfahan last summer.',
        correct: 'I went to Isfahan last summer.',
        noteFa: 'برای فعل اصلی گذشته ساده از was قبل از فعل ساده استفاده نکنید.'
      }
    ],
    examples: [
      { en: 'We visited the National Museum of Iran last Thursday.', fa: 'پنج‌شنبه گذشته از موزه ملی ایران بازدید کردیم.', highlight: 'visited' },
      { en: 'Did you finish reading that English article?', fa: 'آیا خواندن آن مقاله انگلیسی را تمام کردی؟', highlight: 'Did you finish' },
      { en: 'I didn\'t buy the ticket because it was too expensive.', fa: 'من بلیط را نخریدم چون خیلی گران بود.', highlight: 'didn\'t buy' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Where _______ you _______ last night?',
        options: ['did / went', 'did / go', 'were / went', 'did / gone'],
        correctIndex: 1,
        explanationFa: 'با کمکی did، فعل اصلی باید به شکل ساده (go) بیاید.'
      },
      {
        id: 'q2',
        question: 'She _______ a beautiful carpet from the bazaar two days ago.',
        options: ['buy', 'bought', 'buys', 'was bought'],
        correctIndex: 1,
        explanationFa: 'شکل گذشته بی‌قاعده buy کلمه bought است.'
      },
      {
        id: 'q3',
        question: 'They _______ know the answer to the teacher’s question.',
        options: ['didn\'t', 'weren\'t', 'don\'t', 'haven\'t'],
        correctIndex: 0,
        explanationFa: 'برای منفی کردن فعل اصلی در گذشته از didn\'t استفاده می‌شود.'
      }
    ]
  },
  {
    id: 'present-perfect-vs-past-simple',
    title: 'Present Perfect vs Past Simple',
    titleFa: 'حال کامل در برابر گذشته ساده',
    level: 'B1',
    category: 'Verbs & Tenses',
    summaryEn: 'Master the difference between finished past time (yesterday, in 2020) and unfinished time / life experiences (ever, never, just, already, since, for).',
    summaryFa: 'تسلط بر تفاوت زمان مشخص و پایان‌یافته در گذشته با تجارب زندگی و کارهایی که اثرشان باقی است.',
    structure: 'Present Perfect: S + have/has + V3 (Past Participle)',
    explanationEn: `Past Simple specifies WHEN something happened (definite finished past time: yesterday, 2 years ago, in 2021).
Present Perfect connects the past to the present:
1. Life experiences without a specific time (e.g. "I have visited Shiraz twice").
2. Unfinished time periods (e.g. "I have drank 3 cups of tea today").
3. Recent actions with present results (e.g. "I have lost my keys - I cannot open the door").
4. Actions starting in the past and continuing now with since/for.`,
    explanationFa: `این یکی از مهم‌ترین مباحث برای زبان‌آموزان ایرانی است چون در فارسی تمایز این دو زمان گاهی با ساختارهای متفاوت بیان می‌شود:
- اگر زمان دقیق در گذشته قید شده باشد (مانند yesterday, last night, in 2020) حتماً از گذشته ساده استفاده کنید.
- اگر تجربه تا زمان حال مطرح است و زمان دقیق مهم نیست، یا اثر کار در زمان حال باقی است، از حال کامل (have/has + V3) استفاده کنید.`,
    persianSpeakerPitfalls: [
      {
        wrong: 'I have seen him yesterday.',
        correct: 'I saw him yesterday.',
        noteFa: 'با کلمه yesterday هرگز حال کامل به کار نمی‌رود؛ باید گذشته ساده باشد.'
      },
      {
        wrong: 'I live in this city since 2018.',
        correct: 'I have lived in this city since 2018.',
        noteFa: 'برای کارهایی که از گذشته تا امروز ادامه دارند از have lived استفاده می‌شود.'
      },
      {
        wrong: 'I have finished my homework 10 minutes ago.',
        correct: 'I finished my homework 10 minutes ago.',
        noteFa: 'کلمه ago فقط با گذشته ساده به کار می‌رود.'
      }
    ],
    examples: [
      { en: 'Have you ever tried traditional Persian Fesenjan?', fa: 'آیا تا به حال خورش فسنجان سنتی را امتحان کرده‌ای؟', highlight: 'Have you ever tried' },
      { en: 'I have studied English for three years, and I can speak confidently now.', fa: 'من سه سال است که انگلیسی خوانده‌ام و اکنون با اعتماد به نفس صحبت می‌کنم.', highlight: 'have studied' },
      { en: 'Ali traveled to Tabriz last summer.', fa: 'علی تابستان گذشته به تبریز سفر کرد.', highlight: 'traveled' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'I _______ to Canada in 2022.',
        options: ['have traveled', 'traveled', 'travel', 'am traveling'],
        correctIndex: 1,
        explanationFa: 'چون سال دقیق در گذشته (in 2022) ذکر شده، گذشته ساده (traveled) صحیح است.'
      },
      {
        id: 'q2',
        question: 'Sarah _______ her keys, so she can’t get into her apartment.',
        options: ['lost', 'has lost', 'loses', 'was lost'],
        correctIndex: 1,
        explanationFa: 'کار در گذشته انجام شده اما نتیجه آن در حال حاضر (نمی‌تواند وارد خانه شود) مشهود است، پس حال کامل (has lost) درست است.'
      },
      {
        id: 'q3',
        question: '_______ you _______ to Dubai before?',
        options: ['Did / be', 'Have / been', 'Were / been', 'Have / went'],
        correctIndex: 1,
        explanationFa: 'برای تجربه زندگی و سفر به مکانی از Have you been to استفاده می‌شود.'
      }
    ]
  },
  {
    id: 'conditionals-zero-first-second-third',
    title: 'Conditionals (0, 1st, 2nd, and 3rd)',
    titleFa: 'جملات شرطی (نوع صفر، اول، دوم و سوم)',
    level: 'B2',
    category: 'Modals & Conditionals',
    summaryEn: 'Express scientific facts (0), real future possibilities (1st), unreal imaginary situations (2nd), and past regrets (3rd).',
    summaryFa: 'بیان حقایق علمی، احتمال واقعی در آینده، موقعیت‌های فرضی و تخیلی، و حسرت‌های گذشته.',
    structure: 'Zero: If + Present, Present | 1st: If + Present, will + V1 | 2nd: If + Past, would + V1 | 3rd: If + Had V3, would have V3',
    explanationEn: `Conditionals allow you to talk about causes, hypothetical scenarios, and counterfactuals:
• Type 0 (Universal truth): If you heat water to 100°C, it boils.
• Type 1 (Realistic future condition): If it rains tomorrow, we will stay home.
• Type 2 (Unreal present/future imagination): If I had more free time, I would learn Spanish.
• Type 3 (Unreal past / regret): If I had studied harder, I would have passed the exam.`,
    explanationFa: `چهار نوع اصلی جملات شرطی:
۱. شرطی نوع صفر: قوانین علمی و حقایق همیشگی (If + حال ساده, حال ساده)
۲. شرطی نوع اول: احتمالات واقعی آینده (If + حال ساده, will + فعل ساده)
۳. شرطی نوع دوم: فرضیات ناممکن یا خیالبافی در زمان حال (If + گذشته ساده, would + فعل ساده)
۴. شرطی نوع سوم: حسرت یا تغییر نیافتنی‌های گذشته (If + had + V3, would have + V3)
نکته: در شرطی نوع دوم برای همه ضمایر معمولاً were به کار می‌رود (If I were you).`,
    persianSpeakerPitfalls: [
      {
        wrong: 'If I will see him tomorrow, I tell him.',
        correct: 'If I see him tomorrow, I will tell him.',
        noteFa: 'در بخش If کلمه will نمی‌آید؛ will در بخش دوم (نتیجه) قرار می‌گیرد.'
      },
      {
        wrong: 'If I was knowing you were coming, I cooked dinner.',
        correct: 'If I had known you were coming, I would have cooked dinner.',
        noteFa: 'برای موقعیت‌های تحقق‌نیافته گذشته از شرطی نوع سوم (had + V3 ... would have + V3) استفاده می‌شود.'
      },
      {
        wrong: 'If I had money, I bought a car.',
        correct: 'If I had money, I would buy a car.',
        noteFa: 'در بخش دوم شرطی نوع دوم حتماً به would نیاز است.'
      }
    ],
    examples: [
      { en: 'If I were you, I would practice with English+ every single day.', fa: 'اگر جای تو بودم، هر روز با انگلیش‌پلاس تمرین می‌کردم.', highlight: 'If I were you, I would' },
      { en: 'If you study consistently, you will pass the IELTS test.', fa: 'اگر مداوم مطالعه کنی، آزمون آیلتس را قبول خواهی شد.', highlight: 'If you study, you will' },
      { en: 'If we had left earlier, we would not have missed the flight.', fa: 'اگر زودتر راه افتاده بودیم، پرواز را از دست نمی‌دادیم.', highlight: 'If we had left, would not have missed' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If it _______ sunny this weekend, we _______ to the Caspian Sea.',
        options: ['is / will go', 'will be / go', 'was / would go', 'is / go'],
        correctIndex: 0,
        explanationFa: 'شرطی نوع اول: بخش if با حال ساده (is) و بخش نتیجه با will go می‌آید.'
      },
      {
        id: 'q2',
        question: 'If I _______ a million dollars, I _______ travel around the world.',
        options: ['have / will', 'had / would', 'had / will', 'have / would'],
        correctIndex: 1,
        explanationFa: 'شرطی نوع دوم (فرضیه خیالی در حال): If + had ..., would travel.'
      },
      {
        id: 'q3',
        question: 'If she _______ her alarm, she would not have been late for the interview.',
        options: ['set', 'had set', 'has set', 'would set'],
        correctIndex: 1,
        explanationFa: 'شرطی نوع سوم (حسرت گذشته): If + had set.'
      }
    ]
  },
  {
    id: 'passive-voice-mastery',
    title: 'Passive Voice (All Tenses)',
    titleFa: 'مجهول در تمام زمان‌ها',
    level: 'B2',
    category: 'Sentence Structure',
    summaryEn: 'Shift focus from the doer of the action to the receiver or the action itself.',
    summaryFa: 'انتقال تمرکز از انجام‌دهنده کار به مفعول یا خود کار انجام شده.',
    structure: 'Passive Formula: Subject + appropriate form of BE + V3 (Past Participle) (+ by agent)',
    explanationEn: `Use the Passive Voice when:
1. The doer is unknown, unimportant, or obvious (e.g. "My bicycle was stolen").
2. You want to focus on the object/result in academic or news contexts (e.g. "The new bridge was opened today").
Formula across tenses:
- Present Simple: is/am/are + V3
- Past Simple: was/were + V3
- Present Perfect: have/has been + V3
- Modals: modal + be + V3 (e.g. "It must be done").`,
    explanationFa: `در جملات مجهول، مفعول جمله معلوم در جایگاه فاعل قرار می‌گیرد.
فرمول کلی: مشتقات فعل To Be متناسب با زمان + شکل سوم فعل (Past Participle / V3).
در نوشتار آکادمیک، مقالات علمی و اخبار رسمی استفاده از مجهول بسیار رایج است.`,
    persianSpeakerPitfalls: [
      {
        wrong: 'The letter was wrote by Maryam.',
        correct: 'The letter was written by Maryam.',
        noteFa: 'در مجهول همیشه باید از شکل سوم فعل (written) استفاده شود نه گذشته ساده.'
      },
      {
        wrong: 'English is speak all over the world.',
        correct: 'English is spoken all over the world.',
        noteFa: 'فعل to be + V3: is spoken'
      },
      {
        wrong: 'The car has been repaired yesterday.',
        correct: 'The car was repaired yesterday.',
        noteFa: 'با yesterday از گذشته ساده مجهول (was repaired) استفاده کنید نه حال کامل.'
      }
    ],
    examples: [
      { en: 'Persepolis was built thousands of years ago in ancient Persia.', fa: 'تخت جمشید هزاران سال پیش در ایران باستان ساخته شد.', highlight: 'was built' },
      { en: 'All documents must be signed before the meeting.', fa: 'تمامی اسناد باید قبل از جلسه امضا شوند.', highlight: 'must be signed' },
      { en: 'New AI features have been added to the application.', fa: 'امکانات جدید هوش مصنوعی به اپلیکیشن افزوده شده است.', highlight: 'have been added' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'This ancient palace _______ by king Darius.',
        options: ['built', 'was built', 'is building', 'has built'],
        correctIndex: 1,
        explanationFa: 'جمله مجهول در گذشته ساده: was built.'
      },
      {
        id: 'q2',
        question: 'The flight _______ due to bad weather conditions.',
        options: ['canceled', 'has been canceled', 'was cancel', 'is canceling'],
        correctIndex: 1,
        explanationFa: 'حال کامل مجهول: has been canceled.'
      }
    ]
  },
  {
    id: 'inversion-and-advanced-syntax',
    title: 'Inversion & Advanced Sentence Structure',
    titleFa: 'وارونگی گرامری و ساختارهای پیشرفته',
    level: 'C1',
    category: 'Advanced Syntax',
    summaryEn: 'Add emphasis and stylistic elegance by inverting subject and auxiliary verb after negative or limiting adverbials.',
    summaryFa: 'تاکید و ایجاد لحن فصیح و رسمی با وارونه کردن فاعل و فعل کمکی بعد از قیدهای منفی یا محدودکننده.',
    structure: 'Negative Adverbial (Seldom, Rarely, Never, Scarcely, Not only) + Auxiliary + Subject + Main Verb',
    explanationEn: `Inversion is a hallmark of C1/C2 advanced English. When a sentence begins with a negative or restrictive expression, we invert the subject and auxiliary verb (like forming a question):
• "I have rarely seen such beauty." -> "Rarely have I seen such beauty."
• "She not only won the prize, but she also inspired everyone." -> "Not only did she win the prize, but she also inspired everyone."
• "Under no circumstances should you share your password."`,
    explanationFa: `ساختار وارونگی (Inversion) یکی از نشانه‌های تسلط در سطح C1 و C2 است.
وقتی جمله را با قیدهای منفی یا محدودکننده مثل Rarely, Seldom, Never, Under no circumstances, Not only شروع می‌کنیم، ساختار فاعل و فعل کمکی مانند یک جمله سوالی جابجا می‌شود. این ساختار در آزمون‌های آیلتس و تافل نمره بخش گرامر شما را به شدت بالا می‌برد.`,
    persianSpeakerPitfalls: [
      {
        wrong: 'Rarely I have seen such dedication.',
        correct: 'Rarely have I seen such dedication.',
        noteFa: 'بعد از Rarely باید فعل کمکی قبل از فاعل بیاید (have I).'
      },
      {
        wrong: 'Not only she passed, but also she got top score.',
        correct: 'Not only did she pass, but she also got the top score.',
        noteFa: 'بعد از Not only در ابتدای جمله نیاز به did + فاعل + فعل ساده داریم.'
      }
    ],
    examples: [
      { en: 'Never have I experienced such authentic hospitality.', fa: 'هرگز چنین مهمان‌نوازی اصیلی را تجربه نکرده بودم.', highlight: 'Never have I experienced' },
      { en: 'Seldom do people realize the power of consistent daily practice.', fa: 'به ندرت افراد قدرت تمرین مداوم روزانه را درک می‌کنند.', highlight: 'Seldom do people realize' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Under no circumstances _______ the door to strangers.',
        options: ['you should open', 'should you open', 'you open', 'did you opened'],
        correctIndex: 1,
        explanationFa: 'وارونگی با Under no circumstances: should you open.'
      },
      {
        id: 'q2',
        question: 'Not only _______ the competition, but she also set a new national record.',
        options: ['she won', 'did she win', 'has she won', 'was she winning'],
        correctIndex: 1,
        explanationFa: 'وارونگی در زمان گذشته ساده با Not only: did she win.'
      }
    ]
  }
];
