#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { loadConfig } from "./config/loader.js";
import { FreeScoutClient } from "./clients/freescout.js";
import { MeilisearchClient } from "./clients/meilisearch.js";
import {
  toolDefinitions,
  handleToolCall,
  getToolJsonSchema,
  type ToolContext,
} from "./tools/index.js";
import { ConfigError, FreeScoutError, MeilisearchError } from "./utils/errors.js";

async function main() {
  // Load configuration
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(`Configuration error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }

  // Initialize clients
  const freescoutClient = new FreeScoutClient(config);
  let meilisearchClient: MeilisearchClient | undefined;

  if (config.meilisearch) {
    meilisearchClient = new MeilisearchClient(config.meilisearch);
  }

  const toolContext: ToolContext = {
    freescoutClient,
    meilisearchClient,
  };

  // Create MCP server
  const server = new Server(
    {
      name: "freescout-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: getToolJsonSchema(tool),
      })),
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, args, toolContext);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      let errorMessage: string;

      if (error instanceof FreeScoutError) {
        errorMessage = `FreeScout API error: ${error.message}`;
        if (error.endpoint) {
          errorMessage += ` (endpoint: ${error.endpoint})`;
        }
      } else if (error instanceof MeilisearchError) {
        errorMessage = `Meilisearch error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server with STDIO transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
