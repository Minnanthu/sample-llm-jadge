import { describe, it, expect } from "vitest";
import {
  getAllCriteria,
  getCoreCriteria,
  getCriterion,
  formatCriteriaBlock,
} from "../../src/rubric/criteria_loader.js";
import { getWeightsForTask } from "../../src/rubric/weights_loader.js";
import { loadSystemPrompt, buildUserPrompt } from "../../src/rubric/prompt_builder.js";
import type { JudgeRequest } from "../../src/types/judge_request.js";

describe("criteria_loader", () => {
  it("loads all 11 criteria", () => {
    const all = getAllCriteria();
    expect(all.length).toBe(11);
  });

  it("loads 9 core criteria", () => {
    const core = getCoreCriteria();
    expect(core.length).toBe(9);
  });

  it("finds a specific criterion", () => {
    const c = getCriterion("accuracy");
    expect(c).toBeDefined();
    expect(c!.description).toContain("Factual");
  });

  it("returns undefined for unknown criterion", () => {
    const c = getCriterion("nonexistent" as never);
    expect(c).toBeUndefined();
  });

  it("formats criteria block with anchors", () => {
    const core = getCoreCriteria();
    const block = formatCriteriaBlock(core);
    expect(block).toContain("### accuracy");
    expect(block).toContain("Score 1:");
    expect(block).toContain("Score 5:");
  });
});

describe("weights_loader", () => {
  it("loads summarization weights", () => {
    const config = getWeightsForTask("summarization");
    expect(config.weights.conciseness).toBe(0.2);
    const sum = Object.values(config.weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  it("loads report_generation weights", () => {
    const config = getWeightsForTask("report_generation");
    expect(config.weights.completeness).toBe(0.15);
  });

  it("loads report_qa weights", () => {
    const config = getWeightsForTask("report_qa");
    expect(config.weights.accuracy).toBe(0.2);
  });

  it("includes conciseness penalty config", () => {
    const config = getWeightsForTask("summarization");
    expect(config.conciseness_penalty.threshold).toBe(2);
    expect(config.conciseness_penalty.penalty).toBe(0.3);
    expect(config.conciseness_penalty.floor).toBe(1.0);
  });

  it("throws for unknown task type", () => {
    expect(() => getWeightsForTask("unknown" as never)).toThrow();
  });
});

describe("prompt_builder", () => {
  const request: JudgeRequest = {
    request_id: "test-001",
    task_type: "summarization",
    input: {
      source_text: "Source text here.",
      instruction: "Summarize this.",
    },
    output: {
      model_name: "gpt-4o",
      generated_text: "Summary here.",
    },
  };

  it("loads system prompt", () => {
    const sys = loadSystemPrompt();
    expect(sys).toContain("Length is NOT a proxy for quality");
  });

  it("builds user prompt with substitutions", () => {
    const prompt = buildUserPrompt(request);
    expect(prompt).toContain("Source text here.");
    expect(prompt).toContain("Summarize this.");
    expect(prompt).toContain("Summary here.");
    expect(prompt).toContain("test-001");
    expect(prompt).toContain("### accuracy");
  });

  it("removes reference_output block when not provided", () => {
    const prompt = buildUserPrompt(request);
    expect(prompt).not.toContain("REFERENCE OUTPUT");
  });

  it("includes reference_output block when provided", () => {
    const reqWithRef: JudgeRequest = {
      ...request,
      input: { ...request.input, reference_output: "Reference here." },
    };
    const prompt = buildUserPrompt(reqWithRef);
    expect(prompt).toContain("REFERENCE OUTPUT");
    expect(prompt).toContain("Reference here.");
  });
});
