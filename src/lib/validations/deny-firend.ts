import { z } from "zod";

export const denyFriendValidator = z.object({
  id: z.string(),
});
