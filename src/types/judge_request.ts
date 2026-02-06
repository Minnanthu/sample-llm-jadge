import type { TaskType } from "./task_type.js";

export interface JudgeRequest {
  request_id: string;
  task_type: TaskType;
  input: {
    source_text: string;
    instruction: string;
    reference_output?: string;
  };
  output: {
    model_name: string;
    generated_text: string;
  };
  metadata?: Record<string, unknown>;
}
