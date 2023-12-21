"use client";

import { Check, UserPlus, X } from "lucide-react";
import { FC, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FirendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const [firendRequests, setFirendRequsts] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  return (
    <>
      {firendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">No pending requests.</p>
      ) : (
        firendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <div>
              <p className="font-medium text-lg">{request.senderName}</p>
              <p className="font-medium text-xs text-zinc-500">
                {request.senderEmail}
              </p>
            </div>
            <button
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FirendRequests;
