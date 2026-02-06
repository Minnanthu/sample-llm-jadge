import type { JudgeRequest, JudgeResult } from "../types/index.js";
import type { Provider } from "../types/provider.js";
import { BaseJudge } from "../providers/base_judge.js";
import { createJudge } from "../providers/factory.js";
import type { JudgeOptions } from "../providers/base_judge.js";
import { applyFormatGate } from "../schemas/format_gate.js";
import { computeScore } from "./scorer.js";
import { getWeightsForTask } from "../rubric/weights_loader.js";
import { logger } from "../utils/logger.js";

export interface RunOptions {
  provider: Provider;
  judgeOptions?: JudgeOptions;
}

export async function runEvaluation(
  request: JudgeRequest,
  options: RunOptions
): Promise<JudgeResult> {
  const judge = createJudge(options.provider, options.judgeOptions);
  return runWithJudge(request, judge);
}

export async function runWithJudge(
  request: JudgeRequest,
  judge: BaseJudge
): Promise<JudgeResult> {
  logger.info(
    `Evaluating request ${request.request_id} with ${judge.provider}/${judge.modelName}`
  );

  const rawResponse = await judge.judge(request);

  const gate = applyFormatGate(request.request_id, judge.modelName, rawResponse);

  if (!gate.passed) {
    logger.warn(
      `Format gate failed for ${request.request_id}: ${gate.errors.join(", ")}`
    );
    return gate.result!;
  }

  const result = gate.result!;

  const weightsConfig = getWeightsForTask(request.task_type);
  const scoring = computeScore(result.scores, weightsConfig);

  result.overall = scoring;
  result.format_valid = true;

  logger.info(
    `Result: weighted_score=${scoring.weighted_score}, pass=${scoring.pass}`
  );

  return result;
}
