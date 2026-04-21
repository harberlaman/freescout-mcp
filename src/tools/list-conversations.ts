import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const listConversationsSchema = z.object({
  mailboxId: z
    .array(z.number())
    .optional()
    .describe("Filter by mailbox ID(s)"),
  folderId: z.number().optional().describe("Filter by folder ID"),
  status: z
    .string()
    .optional()
    .describe("Filter by status: active, pending, closed, spam. Comma-separated for multiple"),
  state: z
    .string()
    .optional()
    .describe("Filter by state: draft, published, deleted"),
  type: z
    .string()
    .optional()
    .describe("Filter by type: email, phone, chat"),
  assignedTo: z
    .number()
    .optional()
    .describe("Filter by assigned user ID. Use 0 for unassigned"),
  customerEmail: z.string().optional().describe("Filter by customer email address"),
  customerPhone: z.string().optional().describe("Filter by customer phone number"),
  customerId: z.number().optional().describe("Filter by customer ID"),
  number: z.number().optional().describe("Filter by conversation number"),
  subject: z.string().optional().describe("Text search in conversation subject"),
  tag: z.string().optional().describe("Filter by tag name"),
  createdByUserId: z
    .number()
    .optional()
    .describe("Filter by the user ID who created the conversation"),
  createdByCustomerId: z
    .number()
    .optional()
    .describe("Filter by the customer ID who created the conversation"),
  createdSince: z
    .string()
    .optional()
    .describe("Filter to conversations created since this datetime (ISO 8601 UTC)"),
  updatedSince: z
    .string()
    .optional()
    .describe("Filter to conversations updated since this datetime (ISO 8601 UTC)"),
  sortField: z
    .string()
    .optional()
    .describe("Sort by field: createdAt, mailboxId, number, subject, updatedAt, waitingSince"),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Sort direction: asc or desc (default: desc)"),
  page: z.number().optional().describe("Page number (default: 1)"),
  pageSize: z.number().optional().describe("Results per page (default: 50)"),
  embed: z
    .string()
    .optional()
    .describe("Comma-separated related data to include: threads, timelogs, tags"),
});

export type ListConversationsInput = z.infer<typeof listConversationsSchema>;

export async function listConversations(
  client: FreeScoutClient,
  input: ListConversationsInput
): Promise<string> {
  const result = await client.listConversations(input);
  return JSON.stringify(result, null, 2);
}
