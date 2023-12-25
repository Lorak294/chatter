"use client";

import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionUserId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionUserId,
  chatId,
  sessionImg,
  chatPartner,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  // pusher live updates setup
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    // add handler
    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming_message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming_message", messageHandler);
    };
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-2-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />

      {messages.map((msg, idx) => {
        const isCurrentUser = msg.senderId === sessionUserId;
        const hasNextMsgFromSameUser =
          messages[idx - 1]?.senderId === messages[idx].senderId;

        return (
          <div className="chat-message" key={`${msg.id}-${msg.timestamp}`}>
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none": !hasNextMsgFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMsgFromSameUser && !isCurrentUser,
                  })}
                >
                  {msg.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  " invisible": hasNextMsgFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
