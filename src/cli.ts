#!/usr/bin/env node

import { Command } from "commander";
import { loadEnv } from "./utils/env.js";
import { setLogLevel } from "./utils/logger.js";
import { runValidate } from "./commands/validate.js";
import { runCommand } from "./commands/run.js";
import { runAggregate } from "./commands/aggregate.js";
import type { Provider } from "./types/provider.js";

loadEnv();

const program = new Command();

program
  .name("llm-judge")
  .description("LLM-as-a-Judge evaluation framework")
  .version("0.1.0")
  .option("--verbose", "enable debug logging")
  .hook("preAction", (cmd) => {
    if (cmd.opts().verbose) {
      setLogLevel("debug");
    }
  });

program
  .command("validate")
  .description("Validate a JSON file against request or result schema")
  .requiredOption("--json <path>", "path to JSON file")
  .option("--schema <type>", "schema type: request or result", "result")
  .action((options: { json: string; schema?: string }) => {
    const valid = runValidate({
      json: options.json,
      schema: (options.schema as "request" | "result") ?? "result",
    });
    process.exit(valid ? 0 : 1);
  });

program
  .command("run")
  .description("Run evaluation on a judge request")
  .requiredOption("--json <path>", "path to request JSON file")
  .requiredOption("--provider <name>", "judge provider: openai or gemini")
  .option("--model <name>", "model name override")
  .option("--output <path>", "output file path")
  .action(async (options: { json: string; provider: string; model?: string; output?: string }) => {
    await runCommand({
      json: options.json,
      provider: options.provider as Provider,
      model: options.model,
      output: options.output,
    });
  });

program
  .command("aggregate")
  .description("Aggregate multiple evaluation results")
  .argument("<files...>", "result JSON files")
  .option("--output <path>", "output file path")
  .action((files: string[], options: { output?: string }) => {
    runAggregate({ files, output: options.output });
  });

program.parse();
