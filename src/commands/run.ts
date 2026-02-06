import { validateRequest } from "../schemas/loader.js";
import { runEvaluation, type RunOptions } from "../evaluation/runner.js";
import { readJson, writeJson } from "../utils/file_io.js";
import { logger } from "../utils/logger.js";
import type { JudgeRequest } from "../types/index.js";
import type { Provider } from "../types/provider.js";

export interface RunCommandOptions {
  json: string;
  provider: Provider;
  model?: string;
  output?: string;
}

export async function runCommand(options: RunCommandOptions): Promise<void> {
  const data = readJson<unknown>(options.json);

  const { valid, errors } = validateRequest(data);
  if (!valid) {
    logger.error(`Invalid request: ${errors.join(", ")}`);
    process.exit(1);
  }

  const request = data as JudgeRequest;

  const runOptions: RunOptions = {
    provider: options.provider,
    judgeOptions: {
      model: options.model,
    },
  };

  const result = await runEvaluation(request, runOptions);

  if (options.output) {
    writeJson(options.output, result);
    logger.info(`Result written to ${options.output}`);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}
