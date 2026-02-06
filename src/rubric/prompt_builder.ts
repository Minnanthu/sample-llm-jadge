import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { TaskType } from "../types/index.js";
import type { JudgeRequest } from "../types/judge_request.js";
import { getCoreCriteria, formatCriteriaBlock } from "./criteria_loader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(__dirname, "../../rubric/prompts");

const TASK_PROMPT_FILES: Record<TaskType, string> = {
  summarization: "uc1_summarization.txt",
  report_generation: "uc2_report_generation.txt",
  report_qa: "uc3_report_qa.txt",
};

export function loadSystemPrompt(): string {
  return readFileSync(resolve(PROMPTS_DIR, "system_judge.txt"), "utf-8");
}

export function buildUserPrompt(request: JudgeRequest): string {
  const templateFile = TASK_PROMPT_FILES[request.task_type];
  let template = readFileSync(resolve(PROMPTS_DIR, templateFile), "utf-8");

  const criteria = getCoreCriteria();
  const criteriaBlock = formatCriteriaBlock(criteria);

  template = template.replace("{{source_text}}", request.input.source_text);
  template = template.replace("{{instruction}}", request.input.instruction);
  template = template.replace("{{generated_text}}", request.output.generated_text);
  template = template.replace("{{request_id}}", request.request_id);
  template = template.replace("{{criteria_block}}", criteriaBlock);

  if (request.input.reference_output) {
    template = template.replace(
      /\{\{#reference_output\}\}([\s\S]*?)\{\{\/reference_output\}\}/,
      "$1"
    );
    template = template.replace(
      "{{reference_output}}",
      request.input.reference_output
    );
  } else {
    template = template.replace(
      /\{\{#reference_output\}\}[\s\S]*?\{\{\/reference_output\}\}/,
      ""
    );
  }

  return template;
}
