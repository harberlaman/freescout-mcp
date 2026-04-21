import { z } from "zod";
import type { FreeScoutClient } from "../clients/freescout.js";

export const getUserSchema = z.object({
  id: z.number().describe("The user ID"),
});

export type GetUserInput = z.infer<typeof getUserSchema>;

export async function getUser(
  client: FreeScoutClient,
  input: GetUserInput
): Promise<string> {
  const result = await client.getUser(input.id);
  return JSON.stringify(result, null, 2);
}
