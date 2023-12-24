import { messageArrayValidator } from "@/lib/validations/message";
import { fetchRedis } from "./redis";
import { notFound } from "next/navigation";

export async function getUserById(id: string) {
  const user = (await fetchRedis("get", `user:${id}`)) as string;
  const userParsed = JSON.parse(user) as User;
  return userParsed;
}

export async function getUserIdByEmail(email: string) {
  const id = (await fetchRedis("get", `user:email:${email}`)) as string;
  return id;
}

export async function getFriendsByUserId(userId: string) {
  const friendsIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendsIds.map(async (friendId) => {
      return await getUserById(friendId);
    })
  );

  return friends;
}

export async function getUsersWhoInvitedMe(callerId: string) {
  const invitatorsIds = (await fetchRedis(
    "smembers",
    `user:${callerId}:incoming_friend_requests`
  )) as string[];
  return invitatorsIds;
}

export async function getIncomingRequests(callerId: string) {
  const incomingSenderIds = await getUsersWhoInvitedMe(callerId);
  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;

      return {
        senderId,
        senderEmail: senderParsed.email,
        senderName: senderParsed.name,
      };
    })
  );
  return incomingFriendRequests;
}

export async function getChatMesseages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((msg) => JSON.parse(msg) as Message);
    const reversedDbMessages = dbMessages.reverse();
    return messageArrayValidator.parse(reversedDbMessages);
  } catch (error) {
    notFound();
  }
}

export async function checkIfUserInvited(
  callerId: string,
  userToCheckId: string
) {
  const isAlreadyInvited = (await fetchRedis(
    "sismember",
    `user:${userToCheckId}:incoming_friend_requests`,
    callerId
  )) as boolean;
  return isAlreadyInvited;
}

export async function checkIfInvitedByUser(
  callerId: string,
  userToCheckId: string
) {
  const isAlreadyInvited = (await fetchRedis(
    "sismember",
    `user:${callerId}:incoming_friend_requests`,
    userToCheckId
  )) as boolean;
  return isAlreadyInvited;
}

export async function checkIfUserIsFriend(
  callerId: string,
  userToCheckId: string
) {
  const isAlreadyFriend = (await fetchRedis(
    "sismember",
    `user:${callerId}:friends`,
    userToCheckId
  )) as boolean;
  return isAlreadyFriend;
}
