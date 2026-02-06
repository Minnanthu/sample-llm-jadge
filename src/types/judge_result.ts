import type { Criterion, Score } from "./criteria.js";

export interface CriterionScoreResult {
  criterion: Criterion;
  score: Score;
  reasoning: string;
}

export interface JudgeResult {
  request_id: string;
  judge_model: string;
  scores: CriterionScoreResult[];
  overall: {
    weighted_score: number;
    pass: boolean;
    conciseness_penalty_applied: boolean;
  };
  format_valid: boolean;
  raw_response?: string;
}
