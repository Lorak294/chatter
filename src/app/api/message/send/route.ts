import {
  checkIfUserIsFriend,
  getFriendsIdsByUserId,
  getUserById,
} from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2)
      return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    // check if chat partner is in friendlist
    if (!(await checkIfUserIsFriend(session.user.id, friendId)))
      return new Response("Unauthorized", { status: 401 });

    // ok, send the msg
    //const sender = await getUserById(session.user.id);
    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      receiverId: friendId,
      timestamp,
    };

    const message = messageValidator.parse(messageData);
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });
    return new Response("OK");
  } catch (error) {
    if (error instanceof Error)
      return new Response(error.message, { status: 500 });
    return new Response("Internal server error.", { status: 500 });
  }
}
