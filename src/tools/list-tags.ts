import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const listTagsSchema = z.object({
  conversationId: z
    .number()
    .optional()
    .describe("Filter tags by conversation ID. If not provided, returns all available tags"),
  page: z.number().optional().describe("Page number (default: 1)"),
  pageSize: z.number().optional().describe("Results per page (default: 50)"),
});

export type ListTagsInput = z.infer<typeof listTagsSchema>;

export async function listTags(
  client: FreeScoutClient,
  input: ListTagsInput
): Promise<string> {
  const result = await client.listTags(input);
  return JSON.stringify(result, null, 2);
}
