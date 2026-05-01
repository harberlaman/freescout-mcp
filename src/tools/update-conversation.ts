import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

const customFieldSchema = z.object({
  id: z.number().describe("Custom field ID"),
  value: z.string().describe("Custom field value"),
});

export const updateConversationSchema = z.object({
  conversationId: z.number().describe("The conversation ID to update"),
  byUser: z
    .number()
    .optional()
    .describe("User ID performing the change. Required when changing status, assignTo, or mailboxId."),
  status: z
    .enum(["active", "pending", "closed", "spam"])
    .optional()
    .describe("New conversation status"),
  assignTo: z
    .number()
    .optional()
    .describe("User ID to reassign the conversation to"),
  mailboxId: z
    .number()
    .optional()
    .describe("Move conversation to a different mailbox"),
  customerId: z
    .number()
    .optional()
    .describe("Change the associated customer"),
  subject: z
    .string()
    .optional()
    .describe("Update the conversation subject"),
  customFields: z.array(customFieldSchema).optional().describe("Custom field values"),
});

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export async function updateConversation(
  client: FreeScoutClient,
  input: UpdateConversationInput
): Promise<string> {
  await client.updateConversation(input);
  return JSON.stringify(
    { conversationId: input.conversationId, status: "updated" },
    null,
    2
  );
}
