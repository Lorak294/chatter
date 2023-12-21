import { getChatMesseages, getUserById } from "@/helpers/dbQueries";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
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

  return <div>Chat page for {chatId}</div>;
};

export default page;
