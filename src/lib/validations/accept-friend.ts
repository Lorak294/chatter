import { z } from "zod";

export const acceptFriendValidator = z.object({
  id: z.string(),
});
