
import { GoogleGenAI, Type } from "@google/genai";
import { CensorshipLevel, SchoolSystemType, Language, LearningContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCensorshipInstruction = (level: CensorshipLevel) => {
  // Base prohibition instruction for all levels on darewast info
  const prohibitedItems = "STRICTLY PROHIBIT: any form of violence, pornography, adult content, discrimination (racial, religious, gender, etc.), and political incorrectness. Content must be purely objective, pedagogical, and informational. Any violation will lead to content rejection.";
  
  switch (level) {
    case 'Strict':
      return `Maintain MAXIMUM censorship. ${prohibitedItems} Focus on foundational literacy and numeracy suitable for early childhood (3+).`;
    case 'Medium':
      return `Maintain HIGH censorship. ${prohibitedItems} Moderate complex topics are allowed if strictly educational.`;
    case 'Low':
      return `Maintain PROFESSIONAL standards. ${prohibitedItems} All academic topics are allowed for an adult audience while remaining objective.`;
    default:
      return `Maintain MAXIMUM censorship. ${prohibitedItems}`;
  }
};

export const scanMedia = async (base64Image: string, mode: 'universal' | 'historical' = 'universal', censorship: CensorshipLevel = 'Strict') => {
  const modeInstruction = mode === 'historical' 
    ? "This is a historical document or artifact. You are a world-class paleographer and bibliophile. Focus on deciphering old fonts, handwritten notes, or faded text. Be precise with archaic language."
    : "This is a modern printed document. Digitalize the text and identify metadata accurately.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Analyze and digitalize this media. ${modeInstruction} ${getCensorshipInstruction(censorship)} Identify: Title, Full text, Media Type (book, magazine, tabloid, paper), Summary, Estimated Era, Language. Return as JSON.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          type: { type: Type.STRING },
          summary: { type: Type.STRING },
          estimatedEra: { type: Type.STRING },
          language: { type: Type.STRING },
        },
        required: ["title", "content", "type", "summary", "estimatedEra", "language"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getPedagogyInsight = async (
  topic: string, 
  schoolSystem: SchoolSystemType, 
  stage: string, 
  grade: string, 
  censorship: CensorshipLevel = 'Strict',
  context: LearningContext = 'core'
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an educational expert, explain the topic "${topic}" for a student in Grade ${grade} (${stage}) of the ${schoolSystem} system. Purpose: ${context}. ${getCensorshipInstruction(censorship)} Provide structured pathway and key concepts.`,
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
};

export const translateMediaContent = async (
  title: string,
  description: string,
  targetLang: Language,
  censorship: CensorshipLevel = 'Strict'
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate to ${targetLang}. ${getCensorshipInstruction(censorship)} Return JSON with "title" and "description". Title: "${title}" Description: "${description}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzePromptQuality = async (prompt: string, lang: Language) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze educational video prompt for clarity, value, and pedagogy mastery. Prompt: "${prompt}". ${getCensorshipInstruction('Strict')} Return JSON feedback.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          criteria: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.NUMBER },
              educationalValue: { type: Type.NUMBER },
              pedagogyAdherence: { type: Type.NUMBER }
            },
            required: ["clarity", "educationalValue", "pedagogyAdherence"]
          }
        },
        required: ["score", "feedback", "suggestions", "criteria"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateVideoPrompts = async (
  metadata: { subject: string; topic: string; theme: string; genre: string },
  lang: Language
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 pedagogical educational video prompts. ${metadata.subject} - ${metadata.topic}. ${getCensorshipInstruction('Strict')} Return JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text);
};

export const getMediaSuggestions = async (
  preferences: { subject: string; topic: string; theme: string; genre: string },
  lang: Language,
  censorship: CensorshipLevel = 'Strict'
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 pedagogical content ideas. ${getCensorshipInstruction(censorship)} Return JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            format: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["title", "reason", "format", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const getInteractiveFeatures = async (content: string, lang: Language) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract hotspots, quiz (3 questions), and visual metaphor from text. ${getCensorshipInstruction('Strict')} Return JSON. Content: "${content.substring(0, 1500)}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hotspots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["term", "explanation"]
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING }
              },
              required: ["question", "options", "answer"]
            }
          },
          visualMetaphor: { type: Type.STRING }
        },
        required: ["hotspots", "quiz", "visualMetaphor"]
      }
    }
  });

  return JSON.parse(response.text);
};
