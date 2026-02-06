import type { Provider } from "../types/provider.js";
import { BaseJudge, type JudgeOptions } from "./base_judge.js";
import { OpenAIJudge } from "./openai_judge.js";
import { GeminiJudge } from "./gemini_judge.js";

export function createJudge(
  provider: Provider,
  options: JudgeOptions = {}
): BaseJudge {
  switch (provider) {
    case "openai":
      return new OpenAIJudge(options);
    case "gemini":
      return new GeminiJudge(options);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
