import OpenAI from "openai";
import type { JudgeRequest } from "../types/index.js";
import { BaseJudge, type JudgeOptions } from "./base_judge.js";
import type { Provider } from "../types/provider.js";

export class OpenAIJudge extends BaseJudge {
  readonly provider: Provider = "openai";
  readonly modelName: string;
  private client: OpenAI;
  private temperature: number;

  constructor(options: JudgeOptions = {}) {
    super();
    this.modelName = options.model ?? "gpt-4o";
    this.temperature = options.temperature ?? 0.0;
    this.client = new OpenAI();
  }

  async evaluate(request: JudgeRequest): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      temperature: this.temperature,
      messages: [
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: this.getUserPrompt(request) },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }
    return content;
  }
}
