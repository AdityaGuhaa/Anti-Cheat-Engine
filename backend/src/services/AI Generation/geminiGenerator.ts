import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";

// Schema stays here — it's just a config object, no env vars needed
const examSchema: Schema = {
  description: "A list of generated MCQ exam questions",
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: "The question text" },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "An array of 4 possible answers",
          },
          correctAnswer: {
            type: SchemaType.STRING,
            description: "The exact string from the options that is correct",
          },
        },
        required: ["text", "options", "correctAnswer"],
      },
    },
  },
  required: ["questions"],
};

// ❌ DELETE these two lines — they read env before dotenv loads
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ ... });

export class AIService {
  private getModel() {
    // ✅ This runs at request time — dotenv is loaded by then
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
      },
    });
  }

  async generateQuestions(content: string, mode: "easy" | "medium" | "hard") {
    const prompts = {
      easy: "Focus on basic definitions and simple recall.",
      medium: "Focus on conceptual understanding and application of theories.",
      hard: "Focus on critical analysis and complex problem solving.",
    };

    const prompt = `
      Act as an expert exam paper setter. Based on the content below, generate 5 Multiple Choice Questions (MCQs) in ${mode} mode.
      Difficulty Guidelines: ${prompts[mode]}
      Content: ${content}
      Each question must have exactly 4 options.
    `;

    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonResponse = JSON.parse(response.text());
      return jsonResponse.questions;
    } catch (err) {
      console.error("Gemini Error:", err);
      throw err;
    }
  }
}