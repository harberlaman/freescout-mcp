import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

const attachmentSchema = z.object({
  fileName: z.string().describe("File name"),
  mimeType: z.string().describe("MIME type"),
  data: z.string().optional().describe("Base64-encoded file content"),
  fileUrl: z.string().optional().describe("URL to download the file from"),
});

const threadSchema = z.object({
  type: z.enum(["customer", "message", "note"]).describe("Thread type"),
  text: z.string().describe("Message body content"),
  user: z.number().optional().describe("User ID (required for message and note types)"),
  customer: z
    .object({
      email: z.string().describe("Customer email"),
      firstName: z.string().optional().describe("Customer first name"),
    })
    .optional()
    .describe("Customer info (required for customer thread type)"),
  to: z.array(z.string()).optional().describe("TO email addresses"),
  cc: z.array(z.string()).optional().describe("CC email addresses"),
  bcc: z.array(z.string()).optional().describe("BCC email addresses"),
  createdAt: z.string().optional().describe("ISO 8601 datetime (only valid when imported=true)"),
  attachments: z.array(attachmentSchema).optional().describe("File attachments"),
});

const customFieldSchema = z.object({
  id: z.number().describe("Custom field ID"),
  value: z.string().describe("Custom field value"),
});

export const createConversationSchema = z.object({
  type: z.enum(["email", "phone", "chat"]).describe("Conversation type"),
  mailboxId: z.number().describe("Mailbox ID to create the conversation in"),
  subject: z.string().describe("Conversation subject line"),
  customer: z
    .object({
      id: z.number().optional().describe("Existing customer ID"),
      email: z.string().optional().describe("Customer email (creates customer if not found)"),
    })
    .describe("Customer - provide either id or email"),
  threads: z
    .array(threadSchema)
    .min(1)
    .describe("At least one thread is required"),
  imported: z.boolean().optional().describe("When true, suppresses outgoing emails and auto-replies"),
  assignTo: z.number().optional().describe("User ID to assign the conversation to"),
  status: z
    .enum(["active", "pending", "closed"])
    .optional()
    .describe("Conversation status"),
  customFields: z.array(customFieldSchema).optional().describe("Custom field values"),
  createdAt: z.string().optional().describe("ISO 8601 datetime"),
  closedAt: z.string().optional().describe("ISO 8601 datetime (only valid for imported conversations)"),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export async function createConversation(
  client: FreeScoutClient,
  input: CreateConversationInput
): Promise<string> {
  const result = await client.createConversation(input);
  return JSON.stringify(result, null, 2);
}
