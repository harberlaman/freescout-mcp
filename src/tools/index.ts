import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";
import type { MeilisearchClient } from "../clients/meilisearch.js";

import {
  listConversationsSchema,
  listConversations,
  type ListConversationsInput,
} from "./list-conversations.js";
import {
  getConversationSchema,
  getConversation,
  type GetConversationInput,
} from "./get-conversation.js";
import { listUsersSchema, listUsers, type ListUsersInput } from "./list-users.js";
import { getUserSchema, getUser, type GetUserInput } from "./get-user.js";
import {
  createThreadSchema,
  createThread,
  type CreateThreadInput,
} from "./create-thread.js";
import {
  createConversationSchema,
  createConversation,
  type CreateConversationInput,
} from "./create-conversation.js";
import {
  updateConversationSchema,
  updateConversation,
  type UpdateConversationInput,
} from "./update-conversation.js";
import {
  deleteConversationSchema,
  deleteConversation,
  type DeleteConversationInput,
} from "./delete-conversation.js";
import { searchSchema, search, type SearchInput } from "./search.js";
import { listTagsSchema, listTags, type ListTagsInput } from "./list-tags.js";
import { setTagsSchema, setTags, type SetTagsInput } from "./set-tags.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "list_conversations",
    description:
      "List conversations from FreeScout with filtering. Supports filtering by status, mailbox, tag, assignee, dates, and pagination.",
    inputSchema: listConversationsSchema,
  },
  {
    name: "get_conversation",
    description:
      "Get a single conversation from FreeScout with full details including threads and tags (via embed option).",
    inputSchema: getConversationSchema,
  },
  {
    name: "list_users",
    description:
      "List users from FreeScout with optional email filter and pagination.",
    inputSchema: listUsersSchema,
  },
  {
    name: "get_user",
    description: "Get a single user from FreeScout by ID.",
    inputSchema: getUserSchema,
  },
  {
    name: "create_thread",
    description:
      "Add a reply or note to a FreeScout conversation. Types: customer (customer reply, requires customerId or customerEmail), message (agent reply, requires user ID), note (internal note, requires user ID).",
    inputSchema: createThreadSchema,
  },
  {
    name: "create_conversation",
    description:
      "Create a new conversation in FreeScout. Requires type (email/phone/chat), mailboxId, subject, customer (id or email), and at least one thread. Set imported=true to suppress outgoing emails.",
    inputSchema: createConversationSchema,
  },
  {
    name: "update_conversation",
    description:
      "Update a FreeScout conversation. Can change status, assignee, mailbox, customer, subject, and custom fields. The byUser parameter is required when changing status, assignTo, or mailboxId.",
    inputSchema: updateConversationSchema,
  },
  {
    name: "search",
    description:
      "Full-text search across FreeScout tickets via Meilisearch. Returns ranked results with filters for status, mailbox, user, and customer. Requires Meilisearch to be configured.",
    inputSchema: searchSchema,
  },
  {
    name: "list_tags",
    description:
      "List available tags from FreeScout. Can optionally filter by conversation ID to get tags for a specific conversation.",
    inputSchema: listTagsSchema,
  },
  {
    name: "set_tags",
    description:
      "Set tags on a FreeScout conversation. WARNING: This REPLACES all existing tags with the provided list. To add tags while preserving existing ones, first call list_tags to get current tags, then include all desired tags.",
    inputSchema: setTagsSchema,
  },
];

export const deleteConversationDefinition: ToolDefinition = {
  name: "delete_conversation",
  description:
    "Permanently delete a FreeScout conversation. WARNING: This is irreversible. Only available when FREESCOUT_ALLOW_DELETE=true is set.",
  inputSchema: deleteConversationSchema,
};

export interface ToolContext {
  freescoutClient: FreeScoutClient;
  meilisearchClient?: MeilisearchClient;
  allowDelete?: boolean;
}

export async function handleToolCall(
  name: string,
  args: unknown,
  context: ToolContext
): Promise<string> {
  switch (name) {
    case "list_conversations": {
      const input = listConversationsSchema.parse(args) as ListConversationsInput;
      return listConversations(context.freescoutClient, input);
    }
    case "get_conversation": {
      const input = getConversationSchema.parse(args) as GetConversationInput;
      return getConversation(context.freescoutClient, input);
    }
    case "list_users": {
      const input = listUsersSchema.parse(args) as ListUsersInput;
      return listUsers(context.freescoutClient, input);
    }
    case "get_user": {
      const input = getUserSchema.parse(args) as GetUserInput;
      return getUser(context.freescoutClient, input);
    }
    case "create_thread": {
      const input = createThreadSchema.parse(args) as CreateThreadInput;
      return createThread(context.freescoutClient, input);
    }
    case "create_conversation": {
      const input = createConversationSchema.parse(args) as CreateConversationInput;
      return createConversation(context.freescoutClient, input);
    }
    case "update_conversation": {
      const input = updateConversationSchema.parse(args) as UpdateConversationInput;
      return updateConversation(context.freescoutClient, input);
    }
    case "delete_conversation": {
      if (!context.allowDelete) {
        throw new Error(
          "delete_conversation is disabled. Set FREESCOUT_ALLOW_DELETE=true to enable it."
        );
      }
      const input = deleteConversationSchema.parse(args) as DeleteConversationInput;
      return deleteConversation(context.freescoutClient, input);
    }
    case "search": {
      if (!context.meilisearchClient) {
        throw new Error(
          "Meilisearch is not configured. Add meilisearch configuration to config.json to use search."
        );
      }
      const input = searchSchema.parse(args) as SearchInput;
      return search(context.meilisearchClient, input);
    }
    case "list_tags": {
      const input = listTagsSchema.parse(args) as ListTagsInput;
      return listTags(context.freescoutClient, input);
    }
    case "set_tags": {
      const input = setTagsSchema.parse(args) as SetTagsInput;
      return setTags(context.freescoutClient, input);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Convert Zod schema to JSON Schema for MCP
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // Handle ZodEffects (schemas with .refine())
  if (schema instanceof z.ZodEffects) {
    return zodToJsonSchema(schema._def.schema);
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      properties[key] = zodToJsonSchema(zodValue);

      // Check if the field is required (not optional)
      if (!(zodValue instanceof z.ZodOptional) && !(zodValue instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema._def.innerType);
    return {
      ...inner,
      default: schema._def.defaultValue(),
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element),
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: schema.options,
    };
  }

  if (schema instanceof z.ZodString) {
    const result: Record<string, unknown> = { type: "string" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  if (schema instanceof z.ZodNumber) {
    const result: Record<string, unknown> = { type: "number" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  if (schema instanceof z.ZodBoolean) {
    const result: Record<string, unknown> = { type: "boolean" };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }

  // Fallback for described schemas
  if ("description" in schema && schema.description) {
    return { description: schema.description };
  }

  return {};
}

// Add descriptions from Zod schema
function addDescriptions(
  jsonSchema: Record<string, unknown>,
  zodSchema: z.ZodType
): Record<string, unknown> {
  // Handle ZodEffects (schemas with .refine())
  let effectiveZodSchema = zodSchema;
  if (zodSchema instanceof z.ZodEffects) {
    effectiveZodSchema = zodSchema._def.schema;
  }

  if (effectiveZodSchema instanceof z.ZodObject) {
    const shape = effectiveZodSchema.shape;
    const properties = jsonSchema.properties as Record<string, Record<string, unknown>> | undefined;

    if (properties) {
      for (const [key, value] of Object.entries(shape)) {
        let zodValue = value as z.ZodType;

        // Unwrap optional/default to get the description
        if (zodValue instanceof z.ZodOptional) {
          zodValue = zodValue.unwrap();
        }
        if (zodValue instanceof z.ZodDefault) {
          zodValue = zodValue._def.innerType;
        }

        if (zodValue.description && properties[key]) {
          properties[key].description = zodValue.description;
        }
      }
    }
  }

  return jsonSchema;
}

export function getToolJsonSchema(tool: ToolDefinition): Record<string, unknown> {
  const schema = zodToJsonSchema(tool.inputSchema);
  return addDescriptions(schema, tool.inputSchema);
}
