import ChatInput from "@/components/ui/ChatInput";
import Messages from "@/components/ui/Messages";
import { getChatMesseages, getUserById } from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    chatId: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // get user IDs from the URL
  const [userId1, userId2] = chatId.split("--");
  // validate whether logged user is one of the participants
  if (session.user.id !== userId1 && session.user.id !== userId2) notFound();
  const chatPartnerId = session.user.id === userId1 ? userId2 : userId1;
  const chatPartner = await getUserById(chatPartnerId);
  const messages = await getChatMesseages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name}'s profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center">
              <span className="font-semibold text-xl text-gray-700 mr-3">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600 font-medium">
              {chatPartner.email}
            </span>
          </div>
        </div>
      </div>
      <Messages
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        sessionUserId={session.user.id}
        initialMessages={messages}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
};

export default page;
