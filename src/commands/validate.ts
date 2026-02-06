import { validateRequest, validateResult } from "../schemas/loader.js";
import { readJson } from "../utils/file_io.js";
import { logger } from "../utils/logger.js";

export interface ValidateOptions {
  json: string;
  schema?: "request" | "result";
}

export function runValidate(options: ValidateOptions): boolean {
  const data = readJson<unknown>(options.json);
  const schemaType = options.schema ?? "result";

  const { valid, errors } =
    schemaType === "request" ? validateRequest(data) : validateResult(data);

  if (valid) {
    logger.info(`Validation passed for ${options.json} (schema: ${schemaType})`);
    console.log(JSON.stringify({ valid: true, file: options.json, schema: schemaType }, null, 2));
  } else {
    logger.error(`Validation failed for ${options.json}`);
    console.log(
      JSON.stringify({ valid: false, file: options.json, schema: schemaType, errors }, null, 2)
    );
  }

  return valid;
}
