import { checkIfUserIsFriend, getUserById } from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { messageValidator } from "@/lib/validations/message";
import { sendMessageValidator } from "@/lib/validations/send-message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    // validate id from the request
    const { text, chatId } = sendMessageValidator.parse(body);
    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2)
      return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    // check if chat partner is in friendlist
    if (!(await checkIfUserIsFriend(session.user.id, friendId)))
      return new Response("Unauthorized", { status: 401 });

    // ok, send the msg
    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      receiverId: friendId,
      timestamp,
    };

    const message = messageValidator.parse(messageData);
    const sender = await getUserById(session.user.id);

    // add to db
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    // send new message through pusher
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming_message",
      message
    );
    // notify the recipient about new chat activity
    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderName: sender.name,
      senderImg: sender.image,
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 });
    if (error instanceof Error)
      return new Response(error.message, { status: 500 });
    return new Response("Internal server error.", { status: 500 });
  }
}
