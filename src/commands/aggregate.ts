import { aggregateResults } from "../evaluation/aggregator.js";
import { readJson, writeJson } from "../utils/file_io.js";
import { logger } from "../utils/logger.js";
import type { JudgeResult } from "../types/index.js";

export interface AggregateOptions {
  files: string[];
  output?: string;
}

export function runAggregate(options: AggregateOptions): void {
  const results: JudgeResult[] = options.files.map((f) =>
    readJson<JudgeResult>(f)
  );

  logger.info(`Aggregating ${results.length} results`);

  const aggregated = aggregateResults(results);

  if (options.output) {
    writeJson(options.output, aggregated);
    logger.info(`Aggregated result written to ${options.output}`);
  } else {
    console.log(JSON.stringify(aggregated, null, 2));
  }
}
