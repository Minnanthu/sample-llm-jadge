import Ajv from "ajv";
import type { ValidateFunction } from "ajv";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = resolve(__dirname, "../../schemas");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvClass = (Ajv as any).default ?? Ajv;
const ajv = new AjvClass({ allErrors: true });

let requestValidator: ValidateFunction | null = null;
let resultValidator: ValidateFunction | null = null;

function loadSchema(filename: string): Record<string, unknown> {
  const path = resolve(SCHEMAS_DIR, filename);
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

export function getRequestValidator(): ValidateFunction {
  if (!requestValidator) {
    const schema = loadSchema("judge_request_v1.schema.json");
    requestValidator = ajv.compile(schema);
  }
  return requestValidator!;
}

export function getResultValidator(): ValidateFunction {
  if (!resultValidator) {
    const schema = loadSchema("judge_result_v1.schema.json");
    resultValidator = ajv.compile(schema);
  }
  return resultValidator!;
}

export function validateRequest(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const validate = getRequestValidator();
  const valid = validate(data) as boolean;
  const errors = valid
    ? []
    : (validate.errors ?? []).map(
        (e) => `${e.instancePath || "/"}: ${e.message ?? "unknown error"}`
      );
  return { valid, errors };
}

export function validateResult(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const validate = getResultValidator();
  const valid = validate(data) as boolean;
  const errors = valid
    ? []
    : (validate.errors ?? []).map(
        (e) => `${e.instancePath || "/"}: ${e.message ?? "unknown error"}`
      );
  return { valid, errors };
}
