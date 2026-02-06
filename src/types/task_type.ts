export const TASK_TYPES = [
  "summarization",
  "report_generation",
  "report_qa",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];
