"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";
interface SidebarChatListProps {
  friends: User[];
  sessionUserId: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({
  friends,
  sessionUserId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  // pusher live updates setup
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionUserId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionUserId}:friends`));

    const chatHandler = (msg: NewChatMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionUserId, msg.senderId)}`;

      if (!shouldNotify) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionUserId={sessionUserId}
          senderImage={msg.senderImg}
          senderId={msg.senderId}
          senderMsg={msg.text}
          senderName={msg.senderName}
        />
      ));

      setUnseenMessages((prev) => [...prev, msg]);
    };
    const firendHandler = () => {
      router.refresh();
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", firendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionUserId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionUserId}:friends`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", firendHandler);
    };
  }, [pathname, sessionUserId, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => {
          !pathname.includes(msg.senderId);
        });
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionUserId,
                friend.id
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
