import { homedir } from "os";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import { z } from "zod";
import { ConfigError } from "../utils/errors.js";

const MeilisearchConfigSchema = z.object({
  host: z.string().url(),
  apiKey: z.string().min(1),
});

const ConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  meilisearch: MeilisearchConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type MeilisearchConfig = z.infer<typeof MeilisearchConfigSchema>;

export function getConfigPath(): string {
  return join(homedir(), ".config", "freescout-mcp", "config.json");
}

export function loadConfig(): Config {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    throw new ConfigError(
      `Configuration file not found at ${configPath}. ` +
        `Please create the file with your FreeScout API credentials.`
    );
  }

  let rawConfig: unknown;
  try {
    const content = readFileSync(configPath, "utf-8");
    rawConfig = JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ConfigError(`Invalid JSON in configuration file: ${error.message}`);
    }
    throw new ConfigError(`Failed to read configuration file: ${error}`);
  }

  const result = ConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new ConfigError(`Invalid configuration:\n${issues}`);
  }

  return result.data;
}
