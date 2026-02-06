export const CORE_CRITERIA = [
  "accuracy",
  "completeness",
  "relevance",
  "coherence",
  "conciseness",
  "clarity",
  "reasoning",
  "harmlessness",
  "format_compliance",
] as const;

export const OPTIONAL_CRITERIA = [
  "citation_quality",
  "actionability",
] as const;

export const ALL_CRITERIA = [...CORE_CRITERIA, ...OPTIONAL_CRITERIA] as const;

export type CoreCriterion = (typeof CORE_CRITERIA)[number];
export type OptionalCriterion = (typeof OPTIONAL_CRITERIA)[number];
export type Criterion = (typeof ALL_CRITERIA)[number];

export type Score = 1 | 2 | 3 | 4 | 5;

export interface CriterionScore {
  criterion: Criterion;
  score: Score;
  reasoning: string;
}

export interface CriterionDefinition {
  criterion: Criterion;
  description: string;
  anchors: {
    score_1: string;
    score_3: string;
    score_5: string;
  };
}
