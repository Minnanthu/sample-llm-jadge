import { describe, it, expect } from "vitest";
import { validateRequest, validateResult } from "../../src/schemas/loader.js";
import { applyFormatGate } from "../../src/schemas/format_gate.js";
import validRequest from "../fixtures/valid_request.json";
import validResult from "../fixtures/valid_result.json";

describe("validateRequest", () => {
  it("accepts a valid request", () => {
    const { valid, errors } = validateRequest(validRequest);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });

  it("rejects request missing required fields", () => {
    const { valid, errors } = validateRequest({ request_id: "x" });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects request with invalid task_type", () => {
    const bad = { ...validRequest, task_type: "invalid_type" };
    const { valid } = validateRequest(bad);
    expect(valid).toBe(false);
  });

  it("rejects request with extra properties", () => {
    const bad = { ...validRequest, extra_field: "nope" };
    const { valid } = validateRequest(bad);
    expect(valid).toBe(false);
  });
});

describe("validateResult", () => {
  it("accepts a valid result", () => {
    const { valid, errors } = validateResult(validResult);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });

  it("rejects result with invalid score value", () => {
    const bad = JSON.parse(JSON.stringify(validResult));
    bad.scores[0].score = 6;
    const { valid } = validateResult(bad);
    expect(valid).toBe(false);
  });

  it("rejects result with too few scores", () => {
    const bad = { ...validResult, scores: validResult.scores.slice(0, 3) };
    const { valid } = validateResult(bad);
    expect(valid).toBe(false);
  });

  it("rejects result missing overall", () => {
    const { overall: _, ...bad } = validResult;
    const { valid } = validateResult(bad);
    expect(valid).toBe(false);
  });
});

describe("applyFormatGate", () => {
  it("passes for valid JSON result", () => {
    const { passed, result } = applyFormatGate(
      "test-001",
      "gpt-4o",
      JSON.stringify(validResult)
    );
    expect(passed).toBe(true);
    expect(result).not.toBeNull();
    expect(result!.format_valid).toBe(true);
  });

  it("fails for invalid JSON string", () => {
    const { passed, result, errors } = applyFormatGate(
      "test-001",
      "gpt-4o",
      "not json at all"
    );
    expect(passed).toBe(false);
    expect(errors).toContain("Failed to parse JSON response");
    expect(result).not.toBeNull();
    expect(result!.format_valid).toBe(false);
    expect(result!.overall.pass).toBe(false);
  });

  it("fails for JSON that does not match schema", () => {
    const { passed, result } = applyFormatGate(
      "test-001",
      "gpt-4o",
      JSON.stringify({ request_id: "x" })
    );
    expect(passed).toBe(false);
    expect(result!.format_valid).toBe(false);
    expect(result!.scores.find((s) => s.criterion === "format_compliance")?.score).toBe(1);
  });
});
