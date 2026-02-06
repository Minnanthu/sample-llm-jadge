import { config } from "dotenv";

let loaded = false;

export function loadEnv(): void {
  if (!loaded) {
    config();
    loaded = true;
  }
}
