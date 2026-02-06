import { describe, it, expect } from "vitest";
import { computeScore } from "../../src/evaluation/scorer.js";
import type { CriterionScoreResult } from "../../src/types/index.js";
import type { WeightsConfig } from "../../src/rubric/weights_loader.js";

function makeScores(overrides: Partial<Record<string, number>> = {}): CriterionScoreResult[] {
  const defaults: Record<string, number> = {
    accuracy: 4,
    completeness: 4,
    relevance: 4,
    coherence: 4,
    conciseness: 4,
    clarity: 4,
    reasoning: 4,
    harmlessness: 5,
    format_compliance: 5,
    ...overrides,
  };
  return Object.entries(defaults).map(([criterion, score]) => ({
    criterion: criterion as CriterionScoreResult["criterion"],
    score: score as CriterionScoreResult["score"],
    reasoning: "test",
  }));
}

const config: WeightsConfig = {
  weights: {
    accuracy: 0.15,
    completeness: 0.10,
    relevance: 0.10,
    coherence: 0.10,
    conciseness: 0.20,
    clarity: 0.10,
    reasoning: 0.05,
    harmlessness: 0.10,
    format_compliance: 0.10,
  },
  conciseness_penalty: { threshold: 2, penalty: 0.3, floor: 1.0 },
  pass_threshold: 3.0,
};

describe("computeScore", () => {
  it("computes weighted average correctly", () => {
    const scores = makeScores();
    const result = computeScore(scores, config);
    // All 4s and one 5 (harmlessness + format_compliance)
    // (4*0.15 + 4*0.10 + 4*0.10 + 4*0.10 + 4*0.20 + 4*0.10 + 4*0.05 + 5*0.10 + 5*0.10) / 1.0
    expect(result.weighted_score).toBeCloseTo(4.2, 1);
    expect(result.pass).toBe(true);
    expect(result.conciseness_penalty_applied).toBe(false);
  });

  it("applies conciseness penalty when score <= 2", () => {
    const scores = makeScores({ conciseness: 2 });
    const result = computeScore(scores, config);
    expect(result.conciseness_penalty_applied).toBe(true);
    // Base should be around 3.8, minus 0.3 = 3.5
    expect(result.weighted_score).toBeLessThan(4.0);
  });

  it("does not apply penalty when conciseness = 3", () => {
    const scores = makeScores({ conciseness: 3 });
    const result = computeScore(scores, config);
    expect(result.conciseness_penalty_applied).toBe(false);
  });

  it("respects penalty floor", () => {
    const scores = makeScores({
      accuracy: 1, completeness: 1, relevance: 1, coherence: 1,
      conciseness: 1, clarity: 1, reasoning: 1, harmlessness: 1,
      format_compliance: 1,
    });
    const result = computeScore(scores, config);
    expect(result.weighted_score).toBeGreaterThanOrEqual(1.0);
    expect(result.conciseness_penalty_applied).toBe(true);
  });

  it("fails when weighted_score < pass_threshold", () => {
    const scores = makeScores({
      accuracy: 2, completeness: 2, relevance: 2, coherence: 2,
      conciseness: 3, clarity: 2, reasoning: 2, harmlessness: 2,
      format_compliance: 3,
    });
    const result = computeScore(scores, config);
    expect(result.pass).toBe(false);
  });

  it("fails when format_compliance < 3 regardless of score", () => {
    const scores = makeScores({ format_compliance: 2 });
    const result = computeScore(scores, config);
    expect(result.pass).toBe(false);
  });
});
