import { z } from "zod";
import type { MeilisearchClient } from "../clients/meilisearch.js";

export const searchSchema = z.object({
  query: z.string().describe("Search query string"),
  limit: z.number().optional().default(20).describe("Maximum results to return (default: 20)"),
  offset: z.number().optional().default(0).describe("Pagination offset (default: 0)"),
  status: z
    .array(z.number())
    .optional()
    .describe("Filter by status code(s): 1=active, 2=pending, 3=closed"),
  mailboxId: z.array(z.number()).optional().describe("Filter by mailbox ID(s)"),
  userId: z.number().optional().describe("Filter by assigned user ID"),
  customerId: z.number().optional().describe("Filter by customer ID"),
});

export type SearchInput = z.infer<typeof searchSchema>;

export async function search(
  client: MeilisearchClient,
  input: SearchInput
): Promise<string> {
  const result = await client.search(input);
  return JSON.stringify(result, null, 2);
}
