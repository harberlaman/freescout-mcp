import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const setTagsSchema = z.object({
  conversationId: z.number().describe("The conversation ID"),
  tags: z
    .array(z.string())
    .describe(
      "Complete list of tag names to set on the conversation. " +
        "WARNING: This REPLACES all existing tags. To add tags while preserving existing ones, " +
        "first call list_tags to get current tags, then include all desired tags in this array."
    ),
});

export type SetTagsInput = z.infer<typeof setTagsSchema>;

export async function setTags(
  client: FreeScoutClient,
  input: SetTagsInput
): Promise<string> {
  await client.setTags(input.conversationId, input.tags);
  return JSON.stringify({
    conversationId: input.conversationId,
    tags: input.tags,
    status: "updated",
  }, null, 2);
}
