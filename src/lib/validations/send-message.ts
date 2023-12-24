import { z } from "zod";

export const sendMessageValidator = z.object({
  text: z.string().min(1),
  chatId: z.string(),
});
