import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const CLI = resolve(ROOT, "src/cli.ts");

function run(args: string[]): { stdout: string; exitCode: number } {
  try {
    const stdout = execFileSync("npx", ["tsx", CLI, ...args], {
      cwd: ROOT,
      encoding: "utf-8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; status?: number };
    return { stdout: e.stdout ?? "", exitCode: e.status ?? 1 };
  }
}

describe("CLI validate command", () => {
  it("validates a valid request JSON", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc1_request.json",
      "--schema",
      "request",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });

  it("validates a valid result JSON", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc1_result.json",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });

  it("fails on invalid JSON (request schema check on result)", () => {
    const { exitCode, stdout } = run([
      "validate",
      "--json",
      "samples/uc1_result.json",
      "--schema",
      "request",
    ]);
    expect(exitCode).toBe(1);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(false);
  });

  it("validates UC2 request", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc2_request.json",
      "--schema",
      "request",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });

  it("validates UC3 request", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc3_request.json",
      "--schema",
      "request",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });

  it("validates UC2 result", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc2_result.json",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });

  it("validates UC3 result", () => {
    const { stdout, exitCode } = run([
      "validate",
      "--json",
      "samples/uc3_result.json",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
  });
});

describe("CLI aggregate command", () => {
  it("aggregates multiple result files", () => {
    const { stdout, exitCode } = run([
      "aggregate",
      "samples/uc1_result.json",
      "samples/uc2_result.json",
      "samples/uc3_result.json",
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.total_evaluations).toBe(3);
    expect(result.pass_count).toBe(3);
    expect(result.pass_rate).toBe(1);
    expect(result.per_criterion.accuracy).toBeDefined();
  });
});

describe("CLI help", () => {
  it("shows help output", () => {
    const { stdout, exitCode } = run(["--help"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("llm-judge");
  });
});
