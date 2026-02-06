import { describe, it, expect } from "vitest";
import { runWithJudge } from "../../src/evaluation/runner.js";
import { BaseJudge } from "../../src/providers/base_judge.js";
import type { JudgeRequest } from "../../src/types/index.js";
import type { Provider } from "../../src/types/provider.js";

class MockJudge extends BaseJudge {
  readonly provider: Provider = "openai";
  readonly modelName = "mock-model";
  private response: string;

  constructor(response: string) {
    super();
    this.response = response;
  }

  async evaluate(_request: JudgeRequest): Promise<string> {
    return this.response;
  }
}

const testRequest: JudgeRequest = {
  request_id: "int-test-001",
  task_type: "summarization",
  input: {
    source_text: "Test source text for integration.",
    instruction: "Summarize this.",
  },
  output: {
    model_name: "gpt-4o",
    generated_text: "Test summary.",
  },
};

describe("runWithJudge (integration)", () => {
  it("processes a valid judge response end-to-end", async () => {
    const mockResponse = JSON.stringify({
      request_id: "int-test-001",
      judge_model: "mock-model",
      scores: [
        { criterion: "accuracy", score: 4, reasoning: "Good accuracy" },
        { criterion: "completeness", score: 3, reasoning: "Decent completeness" },
        { criterion: "relevance", score: 5, reasoning: "Very relevant" },
        { criterion: "coherence", score: 4, reasoning: "Well structured" },
        { criterion: "conciseness", score: 5, reasoning: "Very concise" },
        { criterion: "clarity", score: 4, reasoning: "Clear" },
        { criterion: "reasoning", score: 3, reasoning: "Basic reasoning" },
        { criterion: "harmlessness", score: 5, reasoning: "Safe" },
        { criterion: "format_compliance", score: 5, reasoning: "Good format" },
      ],
      overall: { weighted_score: 4.0, pass: true, conciseness_penalty_applied: false },
      format_valid: true,
    });

    const judge = new MockJudge(mockResponse);
    const result = await runWithJudge(testRequest, judge);

    expect(result.request_id).toBe("int-test-001");
    expect(result.format_valid).toBe(true);
    expect(result.overall.pass).toBe(true);
    expect(result.overall.weighted_score).toBeGreaterThan(0);
    expect(result.scores.length).toBe(9);
  });

  it("handles format gate failure gracefully", async () => {
    const judge = new MockJudge("not valid json");
    const result = await runWithJudge(testRequest, judge);

    expect(result.format_valid).toBe(false);
    expect(result.overall.pass).toBe(false);
    expect(result.overall.weighted_score).toBe(1.0);
  });

  it("recalculates scores with correct weights", async () => {
    const mockResponse = JSON.stringify({
      request_id: "int-test-001",
      judge_model: "mock-model",
      scores: [
        { criterion: "accuracy", score: 5, reasoning: "Perfect" },
        { criterion: "completeness", score: 5, reasoning: "Perfect" },
        { criterion: "relevance", score: 5, reasoning: "Perfect" },
        { criterion: "coherence", score: 5, reasoning: "Perfect" },
        { criterion: "conciseness", score: 5, reasoning: "Perfect" },
        { criterion: "clarity", score: 5, reasoning: "Perfect" },
        { criterion: "reasoning", score: 5, reasoning: "Perfect" },
        { criterion: "harmlessness", score: 5, reasoning: "Perfect" },
        { criterion: "format_compliance", score: 5, reasoning: "Perfect" },
      ],
      overall: { weighted_score: 3.0, pass: true, conciseness_penalty_applied: false },
      format_valid: true,
    });

    const judge = new MockJudge(mockResponse);
    const result = await runWithJudge(testRequest, judge);

    // All 5s should give weighted_score = 5.0
    expect(result.overall.weighted_score).toBe(5.0);
  });

  it("applies conciseness penalty when appropriate", async () => {
    const mockResponse = JSON.stringify({
      request_id: "int-test-001",
      judge_model: "mock-model",
      scores: [
        { criterion: "accuracy", score: 4, reasoning: "Good" },
        { criterion: "completeness", score: 4, reasoning: "Good" },
        { criterion: "relevance", score: 4, reasoning: "Good" },
        { criterion: "coherence", score: 4, reasoning: "Good" },
        { criterion: "conciseness", score: 1, reasoning: "Very verbose" },
        { criterion: "clarity", score: 4, reasoning: "Good" },
        { criterion: "reasoning", score: 4, reasoning: "Good" },
        { criterion: "harmlessness", score: 4, reasoning: "Good" },
        { criterion: "format_compliance", score: 4, reasoning: "Good" },
      ],
      overall: { weighted_score: 4.0, pass: true, conciseness_penalty_applied: false },
      format_valid: true,
    });

    const judge = new MockJudge(mockResponse);
    const result = await runWithJudge(testRequest, judge);

    expect(result.overall.conciseness_penalty_applied).toBe(true);
  });
});
