import type { JudgeRequest, JudgeResult } from "../types/index.js";
import type { Provider } from "../types/provider.js";
import { loadSystemPrompt, buildUserPrompt } from "../rubric/prompt_builder.js";

export interface JudgeOptions {
  model?: string;
  temperature?: number;
}

export abstract class BaseJudge {
  abstract readonly provider: Provider;
  abstract readonly modelName: string;

  protected getSystemPrompt(): string {
    return loadSystemPrompt();
  }

  protected getUserPrompt(request: JudgeRequest): string {
    return buildUserPrompt(request);
  }

  abstract evaluate(request: JudgeRequest): Promise<string>;

  async judge(request: JudgeRequest): Promise<string> {
    return this.evaluate(request);
  }
}
