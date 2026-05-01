import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const deleteConversationSchema = z.object({
  conversationId: z.number().describe("The conversation ID to delete. WARNING: This permanently deletes the conversation and is irreversible."),
});

export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;

export async function deleteConversation(
  client: FreeScoutClient,
  input: DeleteConversationInput
): Promise<string> {
  await client.deleteConversation(input.conversationId);
  return JSON.stringify(
    { conversationId: input.conversationId, status: "deleted" },
    null,
    2
  );
}
