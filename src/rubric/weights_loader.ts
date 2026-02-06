import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { TaskType, CoreCriterion } from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUBRIC_DIR = resolve(__dirname, "../../rubric");

export interface ConcisenessPenaltyConfig {
  threshold: number;
  penalty: number;
  floor: number;
}

export interface WeightsConfig {
  weights: Record<CoreCriterion, number>;
  conciseness_penalty: ConcisenessPenaltyConfig;
  pass_threshold: number;
}

interface WeightsFile {
  version: string;
  conciseness_penalty: ConcisenessPenaltyConfig;
  pass_threshold: number;
  presets: Record<string, Record<string, number>>;
}

let cachedWeights: WeightsFile | null = null;

function loadWeightsFile(): WeightsFile {
  if (!cachedWeights) {
    const raw = readFileSync(
      resolve(RUBRIC_DIR, "weights_presets_v1.json"),
      "utf-8"
    );
    cachedWeights = JSON.parse(raw) as WeightsFile;
  }
  return cachedWeights;
}

export function getWeightsForTask(taskType: TaskType): WeightsConfig {
  const file = loadWeightsFile();
  const preset = file.presets[taskType];
  if (!preset) {
    throw new Error(`No weight preset found for task type: ${taskType}`);
  }
  return {
    weights: preset as Record<CoreCriterion, number>,
    conciseness_penalty: file.conciseness_penalty,
    pass_threshold: file.pass_threshold,
  };
}
