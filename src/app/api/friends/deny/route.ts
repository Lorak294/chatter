import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { denyFriendValidator } from "@/lib/validations/deny-firend";
import { getServerSession } from "next-auth";
import { z } from "zod";

async function denyFriendRequest(denierId: string, userToDenyId: string) {
  await db.srem(`user:${denierId}:incoming_friend_requests`, userToDenyId);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // check auth
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    // validate id from the request
    const { id: idToDeny } = denyFriendValidator.parse(body);

    // deny friend request
    await denyFriendRequest(session.user.id, idToDeny);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 });
    return new Response("Invalid request", { status: 400 });
  }
}
