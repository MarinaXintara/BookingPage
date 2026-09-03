

export type MessageFolder = "inbox" | "sent";

export interface MessageContact {
  userId: number;
  name: string;
  eventId: number;
  eventTitle: string;
}

export interface Message {
  id: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  eventId: number;
  eventTitle: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageInput {
  receiverId: number;
  eventId: number;
  subject: string;
  body: string;
}


export async function getInbox(signal?: AbortSignal): Promise<Message[]> {

  const response = await fetch("http://localhost:8080/api/messages/receivedMessages",
    {
      method: "GET",
      credentials: "include",
      signal,
    });
  
  return response.json();

}
export async function getSentMessages(signal?: AbortSignal): Promise<Message[]> {
  const response = await fetch("http://localhost:8080/api/messages/sentMessages",
    {
      method: "GET",
      credentials: "include",
      signal,
    });
  
  return response.json();
}

export async function getRecipients(signal?: AbortSignal): Promise<MessageContact[]> {

  const response = await fetch("http://localhost:8080/api/users/getUsersForMessages",
    {
      method: "GET",
      credentials: "include",
      signal,
    });
  
  return response.json();

}



export async function sendMessage(data: SendMessageInput,signal?: AbortSignal): Promise<Message> {
  
  const response= await fetch("http://localhost:8080/api/messages",

     {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal,
    });

    return response.json();
  
}  


  export async function markMessageAsRead( messageId: string,
  signal?: AbortSignal
): Promise<void> {

  const response = await fetch(
    `http://localhost:8080/api/messages/${messageId}/read`,
    {
      method: "PATCH",
      credentials: "include",
      signal,
    }
  );

  if (!response.ok) throw new Error("Could not mark as read message.");
}

export async function deleteMessage(
  messageId: string,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/api/messages/deleteMessage/${messageId}`,
    {
      method: "DELETE",
      credentials: "include",
      signal,
    },
  );

  if (!response.ok) throw new Error("Could not delete message.");
}
  
