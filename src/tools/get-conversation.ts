import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const getConversationSchema = z.object({
  id: z.number().describe("The conversation ID"),
  embed: z
    .string()
    .optional()
    .default("threads")
    .describe("Comma-separated list of related data to include: threads, timelogs, tags (default: threads)"),
});

export type GetConversationInput = z.infer<typeof getConversationSchema>;

export async function getConversation(
  client: FreeScoutClient,
  input: GetConversationInput
): Promise<string> {
  const result = await client.getConversation(input.id, input.embed);
  return JSON.stringify(result, null, 2);
}
