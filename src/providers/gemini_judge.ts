import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JudgeRequest } from "../types/index.js";
import { BaseJudge, type JudgeOptions } from "./base_judge.js";
import type { Provider } from "../types/provider.js";

export class GeminiJudge extends BaseJudge {
  readonly provider: Provider = "gemini";
  readonly modelName: string;
  private client: GoogleGenerativeAI;
  private temperature: number;

  constructor(options: JudgeOptions = {}) {
    super();
    this.modelName = options.model ?? "gemini-1.5-pro";
    this.temperature = options.temperature ?? 0.0;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async evaluate(request: JudgeRequest): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: this.temperature,
        responseMimeType: "application/json",
      },
      systemInstruction: this.getSystemPrompt(),
    });

    const result = await model.generateContent(this.getUserPrompt(request));
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned empty response");
    }
    return text;
  }
}
