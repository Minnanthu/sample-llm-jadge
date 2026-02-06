import { validateResult } from "./loader.js";
import type { JudgeResult, CriterionScoreResult } from "../types/index.js";

export interface FormatGateResult {
  passed: boolean;
  errors: string[];
  result: JudgeResult | null;
}

export function applyFormatGate(
  requestId: string,
  judgeModel: string,
  rawResponse: string
): FormatGateResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawResponse);
  } catch {
    return {
      passed: false,
      errors: ["Failed to parse JSON response"],
      result: buildFailedResult(requestId, judgeModel, rawResponse),
    };
  }

  const { valid, errors } = validateResult(parsed);
  if (!valid) {
    return {
      passed: false,
      errors,
      result: buildFailedResult(requestId, judgeModel, rawResponse),
    };
  }

  return {
    passed: true,
    errors: [],
    result: parsed as JudgeResult,
  };
}

function buildFailedResult(
  requestId: string,
  judgeModel: string,
  rawResponse: string
): JudgeResult {
  const failScores: CriterionScoreResult[] = [
    "accuracy",
    "completeness",
    "relevance",
    "coherence",
    "conciseness",
    "clarity",
    "reasoning",
    "harmlessness",
    "format_compliance",
  ].map((criterion) => ({
    criterion: criterion as CriterionScoreResult["criterion"],
    score: 1 as const,
    reasoning:
      criterion === "format_compliance"
        ? "Format gate failed: response did not conform to required JSON schema"
        : "Not evaluated due to format gate failure",
  }));

  return {
    request_id: requestId,
    judge_model: judgeModel,
    scores: failScores,
    overall: {
      weighted_score: 1.0,
      pass: false,
      conciseness_penalty_applied: false,
    },
    format_valid: false,
    raw_response: rawResponse,
  };
}
