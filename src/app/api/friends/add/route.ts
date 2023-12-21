import {
  checkIfUserInvited,
  checkIfUserIsFriend,
  getUserIdByEmail,
} from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // validate email from the request
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // get user id from email using the Redis db
    const idToAdd = await getUserIdByEmail(emailToAdd);
    if (!idToAdd)
      return new Response("This user does not exist.", { status: 400 });

    // get the sender session
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    // do not allow adding yourself
    if (idToAdd == session.user.id)
      return new Response("Cannot add yourself as a friend.", { status: 400 });

    // check if user already invited
    if (await checkIfUserInvited(session.user.id, idToAdd))
      return new Response("This user already has a pending invitation.", {
        status: 400,
      });

    // check if user already a friend
    if (await checkIfUserIsFriend(session.user.id, idToAdd))
      return new Response("This user is your friend.", {
        status: 400,
      });

    // valid request, creaqte friend invitation
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 });
    return new Response("Invalid request", { status: 400 });
  }
}
