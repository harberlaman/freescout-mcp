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
  allowDelete: z.boolean().optional().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;
export type MeilisearchConfig = z.infer<typeof MeilisearchConfigSchema>;

export function getConfigPath(): string {
  return join(homedir(), ".config", "freescout-mcp", "config.json");
}

function loadFromEnv(): Record<string, unknown> | null {
  const baseUrl = process.env.FREESCOUT_BASE_URL;
  const apiKey = process.env.FREESCOUT_API_KEY;

  if (!baseUrl || !apiKey) {
    return null;
  }

  const config: Record<string, unknown> = { baseUrl, apiKey };

  const meilisearchHost = process.env.MEILISEARCH_HOST;
  const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;
  if (meilisearchHost && meilisearchApiKey) {
    config.meilisearch = { host: meilisearchHost, apiKey: meilisearchApiKey };
  }

  const allowDelete = process.env.FREESCOUT_ALLOW_DELETE;
  if (allowDelete !== undefined) {
    config.allowDelete = allowDelete === "true";
  }

  return config;
}

export function loadConfig(): Config {
  // Try environment variables first
  const envConfig = loadFromEnv();
  if (envConfig) {
    const result = ConfigSchema.safeParse(envConfig);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new ConfigError(`Invalid environment variable configuration:\n${issues}`);
    }
    return result.data;
  }

  // Fall back to config file
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    throw new ConfigError(
      `Configuration not found. Either set FREESCOUT_BASE_URL and FREESCOUT_API_KEY ` +
        `environment variables, or create a config file at ${configPath}.`
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
