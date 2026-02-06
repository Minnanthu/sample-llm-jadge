import type { CriterionScoreResult } from "../types/index.js";
import type { WeightsConfig } from "../rubric/weights_loader.js";

export interface ScoringResult {
  weighted_score: number;
  pass: boolean;
  conciseness_penalty_applied: boolean;
}

export function computeScore(
  scores: CriterionScoreResult[],
  config: WeightsConfig
): ScoringResult {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [criterion, weight] of Object.entries(config.weights)) {
    const found = scores.find((s) => s.criterion === criterion);
    if (found) {
      weightedSum += found.score * weight;
      totalWeight += weight;
    }
  }

  let weighted_score = totalWeight > 0 ? weightedSum / totalWeight : 1.0;

  const concisenessScore = scores.find((s) => s.criterion === "conciseness");
  let conciseness_penalty_applied = false;

  if (
    concisenessScore &&
    concisenessScore.score <= config.conciseness_penalty.threshold
  ) {
    weighted_score = Math.max(
      config.conciseness_penalty.floor,
      weighted_score - config.conciseness_penalty.penalty
    );
    conciseness_penalty_applied = true;
  }

  weighted_score = Math.round(weighted_score * 100) / 100;

  const formatScore = scores.find((s) => s.criterion === "format_compliance");
  const formatValid = formatScore ? formatScore.score >= 3 : true;

  const pass = formatValid && weighted_score >= config.pass_threshold;

  return { weighted_score, pass, conciseness_penalty_applied };
}
