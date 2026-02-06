import { readFileSync, writeFileSync } from "node:fs";

export function readJson<T>(path: string): T {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
