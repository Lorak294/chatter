"use client";

import { cn } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { FC, useRef, useState } from "react";

interface MessagesProps {
  initialMessages: Message[];
  sessionUserId: string;
}

const Messages: FC<MessagesProps> = ({ initialMessages, sessionUserId }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

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
                    {msg.timestamp}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
