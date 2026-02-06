import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CriterionDefinition, Criterion } from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUBRIC_DIR = resolve(__dirname, "../../rubric");

interface CriteriaFile {
  version: string;
  criteria: Array<CriterionDefinition & { optional?: boolean }>;
}

let cachedCriteria: CriteriaFile | null = null;

function loadCriteriaFile(): CriteriaFile {
  if (!cachedCriteria) {
    const raw = readFileSync(resolve(RUBRIC_DIR, "criteria_v1.json"), "utf-8");
    cachedCriteria = JSON.parse(raw) as CriteriaFile;
  }
  return cachedCriteria;
}

export function getAllCriteria(): CriterionDefinition[] {
  return loadCriteriaFile().criteria;
}

export function getCoreCriteria(): CriterionDefinition[] {
  return loadCriteriaFile().criteria.filter((c) => !(c as { optional?: boolean }).optional);
}

export function getCriterion(name: Criterion): CriterionDefinition | undefined {
  return loadCriteriaFile().criteria.find((c) => c.criterion === name);
}

export function formatCriteriaBlock(criteria: CriterionDefinition[]): string {
  return criteria
    .map(
      (c) =>
        `### ${c.criterion}\n${c.description}\n- Score 1: ${c.anchors.score_1}\n- Score 3: ${c.anchors.score_3}\n- Score 5: ${c.anchors.score_5}`
    )
    .join("\n\n");
}
