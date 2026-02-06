import type { JudgeResult, Criterion } from "../types/index.js";

export interface AggregatedResult {
  total_evaluations: number;
  pass_count: number;
  fail_count: number;
  pass_rate: number;
  average_weighted_score: number;
  per_criterion: Record<string, { average: number; min: number; max: number }>;
  conciseness_penalty_rate: number;
}

export function aggregateResults(results: JudgeResult[]): AggregatedResult {
  if (results.length === 0) {
    return {
      total_evaluations: 0,
      pass_count: 0,
      fail_count: 0,
      pass_rate: 0,
      average_weighted_score: 0,
      per_criterion: {},
      conciseness_penalty_rate: 0,
    };
  }

  const passCount = results.filter((r) => r.overall.pass).length;
  const penaltyCount = results.filter(
    (r) => r.overall.conciseness_penalty_applied
  ).length;

  const avgWeighted =
    results.reduce((sum, r) => sum + r.overall.weighted_score, 0) /
    results.length;

  const criterionScores: Record<string, number[]> = {};
  for (const result of results) {
    for (const score of result.scores) {
      if (!criterionScores[score.criterion]) {
        criterionScores[score.criterion] = [];
      }
      criterionScores[score.criterion].push(score.score);
    }
  }

  const perCriterion: Record<
    string,
    { average: number; min: number; max: number }
  > = {};
  for (const [criterion, scores] of Object.entries(criterionScores)) {
    perCriterion[criterion] = {
      average:
        Math.round(
          (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
        ) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
    };
  }

  return {
    total_evaluations: results.length,
    pass_count: passCount,
    fail_count: results.length - passCount,
    pass_rate: Math.round((passCount / results.length) * 100) / 100,
    average_weighted_score: Math.round(avgWeighted * 100) / 100,
    per_criterion: perCriterion,
    conciseness_penalty_rate:
      Math.round((penaltyCount / results.length) * 100) / 100,
  };
}
