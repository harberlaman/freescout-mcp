import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";
import type { Conversation, Thread } from "../types/freescout.js";

export const getConversationSchema = z.object({
  id: z.number().describe("The conversation ID"),
  embed: z
    .string()
    .optional()
    .default("threads")
    .describe("Comma-separated list of related data to include: threads, timelogs, tags (default: threads)"),
  threadTypes: z
    .string()
    .optional()
    .default("customer,message,note")
    .describe(
      'Comma-separated thread types to include (default: "customer,message,note" which excludes lineitem system events). Pass "all" to include everything.'
    ),
  cleanHtml: z
    .boolean()
    .optional()
    .default(false)
    .describe("Strip HTML tags from thread bodies and decode common entities, returning plain text"),
  fields: z
    .string()
    .optional()
    .describe("Comma-separated top-level conversation fields to return (e.g. \"id,number,subject,status,_embedded\"). Omit to return all fields."),
  threadFields: z
    .string()
    .optional()
    .describe("Comma-separated fields to keep on each thread object (e.g. \"id,type,body,createdAt\"). Omit to return all fields."),
});

export type GetConversationInput = z.infer<typeof getConversationSchema>;

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickFields(obj: Record<string, unknown>, fieldList: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fieldList) {
    const key = field.trim();
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export async function getConversation(
  client: FreeScoutClient,
  input: GetConversationInput
): Promise<string> {
  const result = await client.getConversation(input.id, input.embed);

  let conversation: Record<string, unknown> = result as unknown as Record<string, unknown>;

  // Filter threads by type
  if (result._embedded?.threads && input.threadTypes !== "all") {
    const allowedTypes = input.threadTypes.split(",").map((t) => t.trim());
    result._embedded.threads = result._embedded.threads.filter(
      (thread: Thread) => allowedTypes.includes(thread.type)
    );
  }

  // Clean HTML from thread bodies
  if (input.cleanHtml && result._embedded?.threads) {
    for (const thread of result._embedded.threads) {
      if (thread.body) {
        thread.body = stripHtml(thread.body);
      }
    }
  }

  // Filter thread fields
  if (input.threadFields && result._embedded?.threads) {
    const threadFieldList = input.threadFields.split(",");
    result._embedded.threads = result._embedded.threads.map(
      (thread: Thread) => pickFields(thread as unknown as Record<string, unknown>, threadFieldList)
    ) as unknown as Thread[];
  }

  // Filter top-level fields
  if (input.fields) {
    const fieldList = input.fields.split(",");
    conversation = pickFields(conversation, fieldList);
  }

  return JSON.stringify(conversation, null, 2);
}
