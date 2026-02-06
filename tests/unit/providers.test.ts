import { describe, it, expect, vi } from "vitest";
import { BaseJudge } from "../../src/providers/base_judge.js";
import { createJudge } from "../../src/providers/factory.js";
import type { JudgeRequest } from "../../src/types/index.js";
import type { Provider } from "../../src/types/provider.js";

class MockJudge extends BaseJudge {
  readonly provider: Provider = "openai";
  readonly modelName = "mock-model";

  async evaluate(_request: JudgeRequest): Promise<string> {
    return JSON.stringify({
      request_id: _request.request_id,
      judge_model: this.modelName,
      scores: [],
      overall: { weighted_score: 3.0, pass: true, conciseness_penalty_applied: false },
      format_valid: true,
    });
  }
}

const testRequest: JudgeRequest = {
  request_id: "test-001",
  task_type: "summarization",
  input: {
    source_text: "Test source text.",
    instruction: "Summarize this.",
  },
  output: {
    model_name: "gpt-4o",
    generated_text: "Test summary.",
  },
};

describe("BaseJudge", () => {
  it("judge() delegates to evaluate()", async () => {
    const judge = new MockJudge();
    const result = await judge.judge(testRequest);
    const parsed = JSON.parse(result);
    expect(parsed.request_id).toBe("test-001");
    expect(parsed.judge_model).toBe("mock-model");
  });

  it("getSystemPrompt returns non-empty string", () => {
    const judge = new MockJudge();
    // Access protected method through the mock
    const prompt = (judge as unknown as { getSystemPrompt: () => string }).getSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain("expert evaluation judge");
  });

  it("getUserPrompt includes request data", () => {
    const judge = new MockJudge();
    const prompt = (judge as unknown as { getUserPrompt: (r: JudgeRequest) => string }).getUserPrompt(testRequest);
    expect(prompt).toContain("Test source text.");
    expect(prompt).toContain("Test summary.");
  });
});

describe("createJudge factory", () => {
  it("creates OpenAIJudge", () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const judge = createJudge("openai");
    expect(judge.provider).toBe("openai");
    vi.unstubAllEnvs();
  });

  it("creates GeminiJudge when API key is set", () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const judge = createJudge("gemini");
    expect(judge.provider).toBe("gemini");
    vi.unstubAllEnvs();
  });

  it("throws for unknown provider", () => {
    expect(() => createJudge("unknown" as Provider)).toThrow("Unknown provider");
  });
});
