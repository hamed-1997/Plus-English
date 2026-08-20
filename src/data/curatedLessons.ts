import { LessonItem } from '../types';

export const CURATED_LESSONS: LessonItem[] = [
  {
    id: 'lesson-1',
    title: 'The Journey from Tehran to Isfahan',
    titleFa: 'سفری از تهران به اصفهان',
    cefrLevel: 'A2',
    contentType: 'Story',
    topic: 'Travel & Culture',
    readingTimeMinutes: 3,
    summaryFa: 'داستانی جذاب درباره سفر دو دوست با قطار به اصفهان و کشف مکان‌های تاریخی و اصطلاحات روزمره سفر.',
    text: `Last Friday, Ali and Reza decided to travel to Isfahan by train. They packed their bags early in the morning and arrived at Tehran Railway Station at 7:00 AM.
The train journey was very comfortable and scenic. Ali looked out the window and noticed the wide golden desert landscape under the morning sun.
When they arrived in Isfahan, they immediately visited the famous Naqsh-e Jahan Square. The historic architecture was breathtaking, and the aroma of freshly brewed tea filled the traditional bazaars.
Reza wanted to practice his English with a group of friendly international tourists who were taking photographs near the Sheikh Lotfollah Mosque.
They exchanged warm greetings and talked about Iranian hospitality. It was an unforgettable weekend full of pleasant memories and natural language practice.`,
    sentences: [
      { id: 1, en: 'Last Friday, Ali and Reza decided to travel to Isfahan by train.', fa: 'جمعه گذشته، علی و رضا تصمیم گرفتند با قطار به اصفهان سفر کنند.' },
      { id: 2, en: 'They packed their bags early in the morning and arrived at Tehran Railway Station at 7:00 AM.', fa: 'آن‌ها صبح زود چمدان‌هایشان را بستند و ساعت ۷ صبح به ایستگاه راه‌آهن تهران رسیدند.' },
      { id: 3, en: 'The train journey was very comfortable and scenic.', fa: 'سفر با قطار بسیار راحت و چشم‌نواز بود.' },
      { id: 4, en: 'Ali looked out the window and noticed the wide golden desert landscape under the morning sun.', fa: 'علی از پنجره به بیرون نگاه کرد و چشم‌انداز وسیع کویر طلایی را زیر آفتاب صبحگاهی دید.' },
      { id: 5, en: 'When they arrived in Isfahan, they immediately visited the famous Naqsh-e Jahan Square.', fa: 'وقتی به اصفهان رسیدند، بلافاصله از میدان مشهور نقش جهان بازدید کردند.' },
      { id: 6, en: 'The historic architecture was breathtaking, and the aroma of freshly brewed tea filled the traditional bazaars.', fa: 'معماری تاریخی خیره‌کننده بود و عطر چای تازه‌دم بازارهای سنتی را پر کرده بود.' },
      { id: 7, en: 'Reza wanted to practice his English with a group of friendly international tourists who were taking photographs near the Sheikh Lotfollah Mosque.', fa: 'رضا می‌خواست انگلیسی خود را با گروهی از گردشگران بین‌المللی خونگرم که نزدیک مسجد شیخ لطف‌الله عکس می‌گرفتند تمرین کند.' },
      { id: 8, en: 'They exchanged warm greetings and talked about Iranian hospitality.', fa: 'آن‌ها احوالپرسی گرمی رد و بدل کردند و درباره مهمان‌نوازی ایرانی گفتگو نمودند.' },
      { id: 9, en: 'It was an unforgettable weekend full of pleasant memories and natural language practice.', fa: 'این یک آخر هفته فراموش‌نشدنی سرشار از خاطرات دلنشین و تمرین طبیعی زبان بود.' }
    ],
    vocabulary: [
      {
        word: 'comfortable',
        ipa: '/ˈkʌm.fə.tə.bəl/',
        persianPronunciation: 'کامفِرتِبِل',
        partOfSpeech: 'adjective',
        cefr: 'A2',
        definitionEn: 'Providing physical ease and relaxation.',
        translationFa: 'راحت، آسوده',
        exampleEn: 'The hotel room was spacious and comfortable.',
        exampleFa: 'اتاق هتل جادار و راحت بود.'
      },
      {
        word: 'breathtaking',
        ipa: '/ˈbreθˌteɪ.kɪŋ/',
        persianPronunciation: 'برِث‌تِیکینگ',
        partOfSpeech: 'adjective',
        cefr: 'B1',
        definitionEn: 'Astonishing or awe-inspiring in quality, so as to take one\'s breath away.',
        translationFa: 'خیره‌کننده، نفس‌گیر',
        exampleEn: 'The view of the historical bridges at sunset was breathtaking.',
        exampleFa: 'منظره پل‌های تاریخی هنگام غروب آفتاب خیره‌کننده بود.'
      },
      {
        word: 'hospitality',
        ipa: '/ˌhɒs.pɪˈtæl.ə.ti/',
        persianPronunciation: 'هاسپیتَلیتی',
        partOfSpeech: 'noun',
        cefr: 'B1',
        definitionEn: 'The friendly and generous reception and entertainment of guests.',
        translationFa: 'مهمان‌نوازی',
        exampleEn: 'Iranian people are globally renowned for their genuine hospitality.',
        exampleFa: 'مردم ایران در سطح جهان به مهمان‌نوازی صمیمانه خود مشهورند.'
      },
      {
        word: 'unforgettable',
        ipa: '/ˌʌn.fəˈɡet.ə.bəl/',
        persianPronunciation: 'آن‌فورگِتِبِل',
        partOfSpeech: 'adjective',
        cefr: 'A2',
        definitionEn: 'Impossible to forget; very memorable.',
        translationFa: 'فراموش‌نشدنی، ماندگار',
        exampleEn: 'Our family trip was truly unforgettable.',
        exampleFa: 'سفر خانوادگی ما واقعاً فراموش‌نشدنی بود.'
      }
    ],
    grammarTip: {
      title: 'Past Simple for Sequential Storytelling',
      titleFa: 'گذشته ساده برای روایت داستانی توالی رویدادها',
      explanationEn: 'When telling a story in English, use the Past Simple for main consecutive actions: "decided", "packed", "arrived", "visited".',
      explanationFa: 'در روایت داستان‌های گذشته، برای افعال پی‌درپی از گذشته ساده استفاده می‌کنیم. دقت کنید که بعد از didn\'t یا در سوال با did فعل به شکل ساده بازمی‌گردد.',
      persianLearnerTip: 'در فارسی معمولاً می‌گوییم «ساعت ۷ رسیدند»، در انگلیسی با حرف اضافه at همراه است: arrived at 7:00 AM.',
      example: 'They packed their bags and arrived on time.'
    },
    comprehensionQuestions: [
      {
        id: 1,
        questionEn: 'How did Ali and Reza travel to Isfahan?',
        questionFa: 'علی و رضا چگونه به اصفهان سفر کردند؟',
        options: ['By airplane', 'By train', 'By bus', 'By private car'],
        correctAnswerIndex: 1,
        explanationFa: 'در متن ذکر شده: "Ali and Reza decided to travel to Isfahan by train."'
      },
      {
        id: 2,
        questionEn: 'What did Reza do when he saw the international tourists?',
        questionFa: 'رضا وقتی گردشگران بین‌المللی را دید چه کرد؟',
        options: [
          'He ignored them',
          'He practiced his English with them',
          'He sold them souvenirs',
          'He asked them for money'
        ],
        correctAnswerIndex: 1,
        explanationFa: 'رضا می‌خواست انگلیسی خود را با گردشگران تمرین کند.'
      },
      {
        id: 3,
        questionEn: 'Which famous historical square did they visit?',
        questionFa: 'آن‌ها از کدام میدان تاریخی مشهور بازدید کردند؟',
        options: ['Azadi Square', 'Naqsh-e Jahan Square', 'Tajrish Square', 'Imam Hossein Square'],
        correctAnswerIndex: 1,
        explanationFa: 'آن‌ها بلافاصله از میدان نقش جهان بازدید کردند.'
      }
    ],
    levelAnalysis: {
      estimatedCefr: 'A2',
      matchTarget: true,
      vocabularyComplexity: 'Moderate',
      grammarComplexity: 'Clear Past Simple',
      readabilityScore: 82,
      feedbackNoteFa: 'متنی روان و بسیار مناسب برای تقویت درک مطلب و افعال گذشته ساده سطح A2.'
    },
    createdAt: new Date().toISOString(),
    isFavorite: true,
  },
  {
    id: 'lesson-2',
    title: 'The AI Revolution in Modern Education',
    titleFa: 'انقلاب هوش مصنوعی در آموزش مدرن',
    cefrLevel: 'B1',
    contentType: 'Article',
    topic: 'Technology & Learning',
    readingTimeMinutes: 4,
    summaryFa: 'مقاله‌ای تحلیلی درباره نحوه تغییر روش یادگیری زبان توسط هوش مصنوعی و مزایای آموزش شخصی‌سازی شده.',
    text: `Artificial intelligence has fundamentally transformed how people acquire new languages across the globe.
In the past, learners had to rely exclusively on fixed textbooks, rigid classroom schedules, and generic grammar drills.
Today, modern AI tutors can analyze each learner's unique strengths and weaknesses in real time.
For example, if an Iranian learner struggles with irregular verbs or English prepositions, the system can instantly generate personalized stories tailored to that exact requirement.
Moreover, speech recognition technology allows students to practice pronunciation in a safe, judgment-free environment without fear of embarrassment.
As technology continues to advance, the barrier to English fluency will become lower than ever before.`,
    sentences: [
      { id: 1, en: 'Artificial intelligence has fundamentally transformed how people acquire new languages across the globe.', fa: 'هوش مصنوعی بنیادین شیوه یادگیری زبان‌های جدید توسط مردم در سراسر جهان را متحول ساخته است.' },
      { id: 2, en: 'In the past, learners had to rely exclusively on fixed textbooks, rigid classroom schedules, and generic grammar drills.', fa: 'در گذشته، زبان‌آموزان مجبور بودند صرفاً به کتاب‌های درسی ثابت، برنامه‌های خشک کلاسی و تمرین‌های عمومی گرامر تکیه کنند.' },
      { id: 3, en: 'Today, modern AI tutors can analyze each learner\'s unique strengths and weaknesses in real time.', fa: 'امروزه، مربیان هوش مصنوعی مدرن می‌توانند نقاط قوت و ضعف منحصر‌به‌فرد هر زبان‌آموز را به صورت بلادرنگ تحلیل کنند.' },
      { id: 4, en: 'For example, if an Iranian learner struggles with irregular verbs or English prepositions, the system can instantly generate personalized stories tailored to that exact requirement.', fa: 'به عنوان مثال، اگر یک زبان‌آموز ایرانی با افعال بی‌قاعده یا حروف اضافه انگلیسی چالش داشته باشد، سیستم می‌تواند فوراً داستان‌های شخصی‌سازی شده مطابق با همان نیاز دقیق تولید کند.' },
      { id: 5, en: 'Moreover, speech recognition technology allows students to practice pronunciation in a safe, judgment-free environment without fear of embarrassment.', fa: 'علاوه بر این، فناوری تشخیص گفتار به دانش‌آموزان اجازه می‌دهد تا تلفظ را در محیطی امن و بدون قضاوت و بدون ترس از خجالت تمرین کنند.' },
      { id: 6, en: 'As technology continues to advance, the barrier to English fluency will become lower than ever before.', fa: 'همانطور که فناوری به پیشرفت خود ادامه می‌دهد، مانع رسیدن به تسلط بر زبان انگلیسی پایین‌تر از همیشه خواهد شد.' }
    ],
    vocabulary: [
      {
        word: 'acquire',
        ipa: '/əˈkwaɪər/',
        persianPronunciation: 'اَکوایر',
        partOfSpeech: 'verb',
        cefr: 'B1',
        definitionEn: 'To gain or learn something through effort and experience.',
        translationFa: 'فراگرفتن، به دست آوردن',
        exampleEn: 'Children acquire languages naturally through daily immersion.',
        exampleFa: 'کودکان زبان‌ها را به طور طبیعی از طریق قرار گرفتن روزانه در محیط یاد می‌گیرند.'
      },
      {
        word: 'tailored',
        ipa: '/ˈteɪ.ləd/',
        persianPronunciation: 'تِیلِرد',
        partOfSpeech: 'adjective',
        cefr: 'B2',
        definitionEn: 'Custom-made, adapted for a particular purpose or person.',
        translationFa: 'شخصی‌سازی شده، متناسب‌سازی شده',
        exampleEn: 'The course offers a tailored curriculum for busy professionals.',
        exampleFa: 'این دوره یک برنامه درسی متناسب‌سازی شده برای متخصصان پرمشغله ارائه می‌دهد.'
      },
      {
        word: 'embarrassment',
        ipa: '/ɪmˈbær.əs.mənt/',
        persianPronunciation: 'ایمبَرِسمِنت',
        partOfSpeech: 'noun',
        cefr: 'B1',
        definitionEn: 'A feeling of self-consciousness, shame, or awkwardness.',
        translationFa: 'شرمساری، خجالت‌زدگی',
        exampleEn: 'Do not let the fear of embarrassment stop you from speaking.',
        exampleFa: 'اجازه ندهید ترس از خجالت مانع صحبت کردن شما شود.'
      }
    ],
    comprehensionQuestions: [
      {
        id: 1,
        questionEn: 'What is one major advantage of modern AI language tutors mentioned in the text?',
        questionFa: 'یکی از مزایای اصلی مربیان هوش مصنوعی زبان که در متن اشاره شده چیست؟',
        options: [
          'They replace teachers completely',
          'They analyze strengths and weaknesses in real time',
          'They are more expensive than traditional schools',
          'They require zero internet connection'
        ],
        correctAnswerIndex: 1,
        explanationFa: 'در متن آمده است که هوش مصنوعی نقاط قوت و ضعف را به صورت بلادرنگ تحلیل می‌کند.'
      },
      {
        id: 2,
        questionEn: 'How does speech recognition help students learn without stress?',
        questionFa: 'فناوری تشخیص گفتار چگونه به یادگیری بدون استرس دانش‌آموزان کمک می‌کند؟',
        options: [
          'By grading exams automatically',
          'By providing a judgment-free environment for pronunciation',
          'By translating words into French',
          'By shortening the lessons'
        ],
        correctAnswerIndex: 1,
        explanationFa: 'محیطی امن و بدون قضاوت برای تمرین تلفظ فراهم می‌آورد.'
      }
    ],
    createdAt: new Date().toISOString(),
    isFavorite: false
  },
  {
    id: 'lesson-3',
    title: 'Ordering at a Cozy Coffee Shop in London',
    titleFa: 'سفارش در یک کافه دنج در لندن',
    cefrLevel: 'A2',
    contentType: 'Dialogue',
    topic: 'Everyday Conversations',
    readingTimeMinutes: 2,
    summaryFa: 'مکالمه‌ای کاربردی و روزمره بین یک مشتری ایرانی و باریستا برای سفارش قهوه و شیرینی با عبارات محترمانه.',
    text: `Barista: Good morning! What can I get started for you today?
Customer: Hi there. Could I please have a medium oat milk latte?
Barista: Sure thing. Would you like that hot or iced?
Customer: Hot, please. And could you make it extra hot if possible?
Barista: Absolutely. Would you like anything to eat with that? We have fresh croissants and blueberry muffins.
Customer: A warm almond croissant sounds delightful. How much is the total?
Barista: That will be £6.50. Are you paying by card or contactless?
Customer: Contactless, please. Here is my phone.
Barista: Perfect, payment approved! Take a seat by the window and I will call your name in a couple of minutes.
Customer: Thank you so much! Have a wonderful day.`,
    sentences: [
      { id: 1, en: 'Barista: Good morning! What can I get started for you today?', fa: 'باریستا: صبح بخیر! امروز چی می‌تونم براتون بیارم؟' },
      { id: 2, en: 'Customer: Hi there. Could I please have a medium oat milk latte?', fa: 'مشتری: سلام. میشه لطفاً یک لاته متوسط با شیر جو دوسر داشته باشم؟' },
      { id: 3, en: 'Barista: Sure thing. Would you like that hot or iced?', fa: 'باریستا: حتماً. گرم میل دارید یا خنک و یخی؟' },
      { id: 4, en: 'Customer: Hot, please. And could you make it extra hot if possible?', fa: 'مشتری: گرم لطفاً. و اگر ممکنه می‌تونید خیلی داغ درستش کنید؟' },
      { id: 5, en: 'Barista: Absolutely. Would you like anything to eat with that? We have fresh croissants and blueberry muffins.', fa: 'باریستا: قطعاً. چیز دیگه‌ای هم برای خوردن همراهش میل دارید؟ کروسان تازه و مافین بلوبری داریم.' },
      { id: 6, en: 'Customer: A warm almond croissant sounds delightful. How much is the total?', fa: 'مشتری: یک کروسان بادام گرم عالی به نظر می‌رسه. مجموع چقدر میشه؟' },
      { id: 7, en: 'Barista: That will be £6.50. Are you paying by card or contactless?', fa: 'باریستا: میشه ۶.۵۰ پوند. با کارت پرداخت می‌کنید یا بدون تماس (کارت‌خوان موبایلی)؟' },
      { id: 8, en: 'Customer: Contactless, please. Here is my phone.', fa: 'مشتری: بدون تماس لطفاً. بفرمایید این هم گوشی من.' },
      { id: 9, en: 'Barista: Perfect, payment approved! Take a seat by the window and I will call your name in a couple of minutes.', fa: 'باریستا: عالیه، پرداخت تایید شد! کنار پنجره بنشینید، چند دقیقه دیگه اسمتون رو صدا می‌زنم.' },
      { id: 10, en: 'Customer: Thank you so much! Have a wonderful day.', fa: 'مشتری: خیلی متشکرم! روز فوق‌العاده‌ای داشته باشید.' }
    ],
    vocabulary: [
      {
        word: 'contactless',
        ipa: '/ˈkɒn.tæk.tləs/',
        persianPronunciation: 'کانتَکت‌لِس',
        partOfSpeech: 'adjective',
        cefr: 'A2',
        definitionEn: 'Relating to electronic payment made by tapping a card or phone on a reader.',
        translationFa: 'پرداخت بدون تماس (تپ کردن کارت یا گوشی)',
        exampleEn: 'Most cafes in London accept contactless payments.',
        exampleFa: 'بیشتر کافه‌ها در لندن پرداخت‌های بدون تماس را می‌پذیرند.'
      },
      {
        word: 'delightful',
        ipa: '/dɪˈlaɪt.fəl/',
        persianPronunciation: 'دیلایت‌فول',
        partOfSpeech: 'adjective',
        cefr: 'B1',
        definitionEn: 'Causing great pleasure or charm.',
        translationFa: 'دلپذیر، عالی، لذت‌بخش',
        exampleEn: 'We spent a delightful afternoon chatting in the garden.',
        exampleFa: 'ما یک بعدازظهر دلپذیر را به گپ زدن در باغ گذراندیم.'
      }
    ],
    comprehensionQuestions: [
      {
        id: 1,
        questionEn: 'What type of milk did the customer order?',
        questionFa: 'مشتری چه نوع شیری سفارش داد؟',
        options: ['Cow milk', 'Oat milk', 'Soy milk', 'Almond milk'],
        correctAnswerIndex: 1,
        explanationFa: 'مشتری درخواست oat milk latte (لاته با شیر جو دوسر) کرد.'
      },
      {
        id: 2,
        questionEn: 'How did the customer pay for the order?',
        questionFa: 'مشتری هزینه سفارش را چگونه پرداخت کرد؟',
        options: ['Cash', 'Bank check', 'Contactless with phone', 'Crypto'],
        correctAnswerIndex: 2,
        explanationFa: 'مشتری به صورت contactless با گوشی تلفن پرداخت کرد.'
      }
    ],
    createdAt: new Date().toISOString(),
    isFavorite: false
  }
];
