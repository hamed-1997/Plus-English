import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Health
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      app: "English+",
      hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Generate Lesson Endpoint
  app.post("/api/gemini/generate-lesson", async (req: Request, res: Response) => {
    try {
      const customKey = req.headers["x-gemini-key"] as string | undefined;
      const ai = getGeminiClient(customKey);

      const {
        cefrLevel = "B1",
        targetCefr = "B2",
        contentType = "Story",
        topic = "Everyday Life & Travel",
        grammarFocus = "Past Simple & Past Continuous",
        targetWords = [],
        length = "medium", // short (~120 words), medium (~220 words), long (~350 words)
        learnerNotes = "",
        weakAreas = [],
      } = req.body;

      if (!ai) {
        return res.status(503).json({
          error: "AI service unavailable. GEMINI_API_KEY is not configured.",
          isOfflineFallbackAvailable: true,
        });
      }

      const prompt = `You are a world-class English teacher and curriculum designer specifically mentoring Persian (Farsi) speaking learners.
Create an engaging, pedagogical English learning lesson with reading text, vocabulary with Persian translations and pronunciation guides, and reading comprehension questions.

LEARNER PROFILE:
- Current CEFR: ${cefrLevel}
- Target CEFR: ${targetCefr}
- Content Type: ${contentType}
- Topic: ${topic}
- Target Grammar Focus: ${grammarFocus}
- Target Words to Integrate Naturally: ${targetWords.length > 0 ? targetWords.join(", ") : "Naturally selected B1/B2 high-frequency words"}
- Weak Areas to Address: ${weakAreas.length > 0 ? weakAreas.join(", ") : "Standard Persian speaker transfer pitfalls"}
- Desired Length: ${length}
- Extra Context: ${learnerNotes || "None"}

REQUIREMENTS:
1. The English text must be natural, engaging, and strictly calibrated to CEFR ${cefrLevel}.
2. Break the text into clean sequential paragraphs and provide clear individual sentence breakdown.
3. For Persian learners, provide Persian translation for key vocabulary, an accurate Persian phonetic pronunciation transliteration (e.g. for "convenient" -> "کانوینی‌ینت", for "adventure" -> "اِدوِنچِر"), IPA, CEFR level, English definition, and an example sentence with Persian translation.
4. Provide a grammar tip explaining the ${grammarFocus} in the context of this lesson with a specific tip for Persian speakers (e.g., contrast with Persian grammar nuances).
5. 3 multiple-choice comprehension questions with 4 options each, correct option index (0-3), and Persian explanation of why it is correct.
6. Provide an estimated reading time in minutes and a difficulty analysis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are the core AI pedagogical engine of English+, generating high quality educational content for English learners with Persian (Farsi) bilingual support.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Engaging English title" },
              titleFa: { type: Type.STRING, description: "Persian translation of the title" },
              cefrLevel: { type: Type.STRING, description: "Calibrated CEFR level (A1, A2, B1, B2, C1, C2)" },
              contentType: { type: Type.STRING, description: "Content type like Story, Dialogue, Article, etc." },
              readingTimeMinutes: { type: Type.NUMBER, description: "Estimated reading time in minutes" },
              topic: { type: Type.STRING, description: "Topic of the lesson" },
              summaryFa: { type: Type.STRING, description: "Brief 1-2 sentence Persian summary" },
              text: { type: Type.STRING, description: "Full text content formatted in paragraphs" },
              sentences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    en: { type: Type.STRING, description: "English sentence" },
                    fa: { type: Type.STRING, description: "Accurate Persian translation of this sentence" },
                  },
                  required: ["id", "en", "fa"],
                },
                description: "Array of individual sentences for synchronized audio playback and tap-to-translate",
              },
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    ipa: { type: Type.STRING, description: "IPA pronunciation like /kənˈviː.ni.ənt/" },
                    persianPronunciation: { type: Type.STRING, description: "Phonetic Persian transliteration guide e.g. 'کانوینی‌ینت'" },
                    partOfSpeech: { type: Type.STRING, description: "noun, verb, adjective, adverb, idiom, etc." },
                    cefr: { type: Type.STRING, description: "A1, A2, B1, B2, C1" },
                    definitionEn: { type: Type.STRING, description: "Simple English definition" },
                    translationFa: { type: Type.STRING, description: "Accurate Persian meaning" },
                    exampleEn: { type: Type.STRING, description: "Example sentence" },
                    exampleFa: { type: Type.STRING, description: "Persian translation of example" },
                  },
                  required: ["word", "ipa", "persianPronunciation", "partOfSpeech", "cefr", "definitionEn", "translationFa", "exampleEn", "exampleFa"],
                },
              },
              grammarTip: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  titleFa: { type: Type.STRING },
                  explanationEn: { type: Type.STRING },
                  explanationFa: { type: Type.STRING },
                  persianLearnerTip: { type: Type.STRING, description: "Specific advice for Iranian / Persian speakers" },
                  example: { type: Type.STRING },
                },
                required: ["title", "titleFa", "explanationEn", "explanationFa", "persianLearnerTip", "example"],
              },
              comprehensionQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    questionEn: { type: Type.STRING },
                    questionFa: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "4 options",
                    },
                    correctAnswerIndex: { type: Type.NUMBER, description: "0, 1, 2, or 3" },
                    explanationFa: { type: Type.STRING, description: "Persian explanation of the correct answer" },
                  },
                  required: ["id", "questionEn", "questionFa", "options", "correctAnswerIndex", "explanationFa"],
                },
              },
              levelAnalysis: {
                type: Type.OBJECT,
                properties: {
                  estimatedCefr: { type: Type.STRING },
                  matchTarget: { type: Type.BOOLEAN },
                  vocabularyComplexity: { type: Type.STRING, description: "Low, Moderate, Challenging" },
                  grammarComplexity: { type: Type.STRING, description: "Low, Moderate, Advanced" },
                  readabilityScore: { type: Type.NUMBER, description: "Score out of 100" },
                  feedbackNoteFa: { type: Type.STRING, description: "Persian feedback note about this lesson" },
                },
                required: ["estimatedCefr", "matchTarget", "vocabularyComplexity", "grammarComplexity", "readabilityScore", "feedbackNoteFa"],
              },
            },
            required: [
              "title",
              "titleFa",
              "cefrLevel",
              "contentType",
              "readingTimeMinutes",
              "summaryFa",
              "text",
              "sentences",
              "vocabulary",
              "grammarTip",
              "comprehensionQuestions",
              "levelAnalysis",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);
      res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("Error generating lesson:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate lesson with AI.",
      });
    }
  });

  // Word Lookup & Deep Dictionary
  app.post("/api/gemini/lookup-word", async (req: Request, res: Response) => {
    try {
      const customKey = req.headers["x-gemini-key"] as string | undefined;
      const ai = getGeminiClient(customKey);
      const { word, contextSentence } = req.body;

      if (!word) {
        return res.status(400).json({ error: "Word is required." });
      }

      if (!ai) {
        return res.status(503).json({
          error: "AI service unavailable. GEMINI_API_KEY is not configured.",
        });
      }

      const prompt = `Provide a comprehensive dictionary entry for the English word "${word}"${contextSentence ? ` in the context of: "${contextSentence}"` : ""}.
Target audience: Persian (Farsi) native speakers learning English.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              ipa: { type: Type.STRING, description: "Accurate IPA e.g. /ˈkɒn.trækt/" },
              persianPronunciation: { type: Type.STRING, description: "Phonetic Persian spelling e.g. 'کانترَکت'" },
              partOfSpeech: { type: Type.STRING, description: "noun, verb, adjective, etc." },
              cefr: { type: Type.STRING, description: "A1, A2, B1, B2, C1, or C2" },
              definitionEn: { type: Type.STRING, description: "Clear English definition" },
              translationFa: { type: Type.STRING, description: "Primary Persian translation" },
              alternativeTranslationsFa: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Other common Persian translations",
              },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    fa: { type: Type.STRING },
                  },
                  required: ["en", "fa"],
                },
                description: "2-3 practical example sentences with Persian translations",
              },
              collocations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Common collocations or idioms with this word",
              },
              synonyms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              antonyms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              persianLearnerTip: {
                type: Type.STRING,
                description: "Helpful tip for Persian speakers (e.g. common false friends or preposition usage)",
              },
            },
            required: [
              "word",
              "ipa",
              "persianPronunciation",
              "partOfSpeech",
              "cefr",
              "definitionEn",
              "translationFa",
              "examples",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error looking up word:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to lookup word" });
    }
  });

  // Text CEFR Level Analyzer
  app.post("/api/gemini/analyze-text", async (req: Request, res: Response) => {
    try {
      const customKey = req.headers["x-gemini-key"] as string | undefined;
      const ai = getGeminiClient(customKey);
      const { text, requestedCefr = "B1" } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required." });
      }

      if (!ai) {
        return res.status(503).json({ error: "AI service unavailable." });
      }

      const prompt = `Analyze this English text for CEFR difficulty and pedagogical qualities for Persian learners:
Requested Target CEFR: ${requestedCefr}

TEXT:
"""
${text}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedCefr: { type: Type.STRING, description: "A1, A2, B1, B2, C1, or C2" },
              requestedCefr: { type: Type.STRING },
              isLevelAppropriate: { type: Type.BOOLEAN },
              difficultyRating: { type: Type.STRING, description: "Easy, Balanced, Challenging, Too Hard" },
              wordCount: { type: Type.NUMBER },
              sentenceCount: { type: Type.NUMBER },
              averageSentenceLength: { type: Type.NUMBER },
              grammarStructuresDetected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of grammar points used in text",
              },
              advancedVocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    cefr: { type: Type.STRING },
                    fa: { type: Type.STRING },
                  },
                  required: ["word", "cefr", "fa"],
                },
              },
              persianSummary: { type: Type.STRING, description: "Summary in Persian" },
              learningAdviceFa: { type: Type.STRING, description: "Advice for the learner in Persian" },
            },
            required: [
              "estimatedCefr",
              "requestedCefr",
              "isLevelAppropriate",
              "difficultyRating",
              "wordCount",
              "grammarStructuresDetected",
              "persianSummary",
              "learningAdviceFa",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error analyzing text:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to analyze text" });
    }
  });

  // Explain Grammar Topic Endpoint
  app.post("/api/gemini/explain-grammar", async (req: Request, res: Response) => {
    try {
      const customKey = req.headers["x-gemini-key"] as string | undefined;
      const ai = getGeminiClient(customKey);
      const { topic, userLevel = "B1", question } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Grammar topic is required." });
      }

      if (!ai) {
        return res.status(503).json({ error: "AI service unavailable." });
      }

      const prompt = `You are a bilingual English-Persian master grammar coach.
Explain the grammar topic: "${topic}" for a ${userLevel} student.
${question ? `Specifically answer this question: "${question}"` : ""}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              cefrLevel: { type: Type.STRING },
              ruleSummaryEn: { type: Type.STRING },
              ruleSummaryFa: { type: Type.STRING },
              structureFormula: { type: Type.STRING, description: "e.g. Subject + have/has + V3" },
              detailedExplanationFa: { type: Type.STRING },
              commonPersianMistakes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    wrong: { type: Type.STRING },
                    correct: { type: Type.STRING },
                    reasonFa: { type: Type.STRING },
                  },
                  required: ["wrong", "correct", "reasonFa"],
                },
              },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    fa: { type: Type.STRING },
                    highlight: { type: Type.STRING },
                  },
                  required: ["en", "fa", "highlight"],
                },
              },
              miniQuiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanationFa: { type: Type.STRING },
                  },
                  required: ["question", "options", "correctIndex", "explanationFa"],
                },
              },
            },
            required: [
              "topic",
              "cefrLevel",
              "ruleSummaryEn",
              "ruleSummaryFa",
              "structureFormula",
              "detailedExplanationFa",
              "commonPersianMistakes",
              "examples",
              "miniQuiz",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error explaining grammar:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to explain grammar" });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[English+] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
