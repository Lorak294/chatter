import { checkIfInvitedByUser, checkIfUserIsFriend } from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { acceptFriendValidator } from "@/lib/validations/accept-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

async function addFriends(addingUserId: string, friendId: string) {
  await db.sadd(`user:${addingUserId}:friends`, friendId);
  await db.sadd(`user:${friendId}:friends`, addingUserId);
  await db.srem(`user:${addingUserId}:incoming_friend_requests`, friendId);
  await db.srem(`user:${friendId}:incoming_friend_requests`, addingUserId);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // validate id from the request
    const { id: idToAdd } = acceptFriendValidator.parse(body);
    // check auth
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    // verify that not already friends
    if (await checkIfUserIsFriend(session.user.id, idToAdd))
      return new Response("Already firends", { status: 400 });

    // verify if has peneding friend request
    if (!(await checkIfInvitedByUser(session.user.id, idToAdd)))
      return new Response("No friend request", { status: 400 });

    // add friends
    await addFriends(session.user.id, idToAdd);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 });
    return new Response("Invalid request", { status: 400 });
  }
}
