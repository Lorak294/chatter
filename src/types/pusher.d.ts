interface IncomingFriendRequest {
  senderId: string;
  senderEmail: string | null | undefined;
  senderName: string | null | undefined;
}

interface NewChatMessage extends Message {
  senderImg: string;
  senderName: string;
}
