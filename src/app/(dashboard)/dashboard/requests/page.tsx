import FirendRequests from "@/components/ui/FriendRequests";
import { getIncomingRequests } from "@/helpers/dbQueries";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // get incoming requests data
  const incomingFriendRequests = await getIncomingRequests(session.user.id);

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Your friend requests</h1>
      <div className="flex flex-col gap-4">
        <FirendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
