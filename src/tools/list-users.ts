import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const listUsersSchema = z.object({
  email: z.string().optional().describe("Filter by user email address"),
  page: z.number().optional().describe("Page number (default: 1)"),
  pageSize: z.number().optional().describe("Results per page (default: 50)"),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;

export async function listUsers(
  client: FreeScoutClient,
  input: ListUsersInput
): Promise<string> {
  const result = await client.listUsers(input);
  return JSON.stringify(result, null, 2);
}
