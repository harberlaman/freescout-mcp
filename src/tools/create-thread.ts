import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const createThreadSchema = z
  .object({
    conversationId: z.number().describe("The conversation ID to add the thread to"),
    type: z
      .enum(["customer", "message", "note"])
      .describe("Thread type: customer (customer reply), message (agent reply), or note (agent note)"),
    text: z.string().describe("The message content"),
    customerId: z
      .number()
      .optional()
      .describe("Customer ID. Required when type is 'customer' (alternative to customerEmail)"),
    customerEmail: z
      .string()
      .optional()
      .describe("Customer email. Required when type is 'customer' (alternative to customerId)"),
    user: z
      .number()
      .optional()
      .describe("User ID of the agent. Required when type is 'message' or 'note'"),
    imported: z
      .boolean()
      .optional()
      .describe("When true, no outgoing emails or notifications are generated"),
    status: z
      .enum(["active", "pending", "closed"])
      .optional()
      .describe("Change the conversation status"),
    state: z
      .enum(["draft", "published"])
      .optional()
      .describe("Thread state (default: published)"),
    to: z.array(z.string()).optional().describe("List of TO email addresses"),
    cc: z.array(z.string()).optional().describe("List of CC email addresses"),
    bcc: z.array(z.string()).optional().describe("List of BCC email addresses"),
    createdAt: z
      .string()
      .optional()
      .describe("Thread creation date (ISO 8601). Only valid when imported is true"),
    attachments: z
      .array(
        z.object({
          fileName: z.string().describe("Name of the attachment file"),
          mimeType: z.string().describe("MIME type of the attachment"),
          data: z.string().optional().describe("Base64-encoded file data"),
          fileUrl: z.string().optional().describe("URL to download the file from"),
        })
      )
      .optional()
      .describe("Array of attachments. Each must have fileName, mimeType, and either data or fileUrl"),
  })
  .refine(
    (data) => {
      if (data.type === "customer") {
        return data.customerId !== undefined || data.customerEmail !== undefined;
      }
      return true;
    },
    {
      message: "customerId or customerEmail is required when type is 'customer'",
      path: ["customerId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "message" || data.type === "note") {
        return data.user !== undefined;
      }
      return true;
    },
    {
      message: "user is required when type is 'message' or 'note'",
      path: ["user"],
    }
  )
  .refine(
    (data) => {
      if (data.createdAt !== undefined) {
        return data.imported === true;
      }
      return true;
    },
    {
      message: "imported must be true when using createdAt",
      path: ["createdAt"],
    }
  );

export type CreateThreadInput = z.infer<typeof createThreadSchema>;

export async function createThread(
  client: FreeScoutClient,
  input: CreateThreadInput
): Promise<string> {
  const result = await client.createThread(input);
  return JSON.stringify(result, null, 2);
}
