
import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInputBar } from "./ChatInputBar";
import type { Message } from "./MessageList";
import type { Attachment } from "./ChatInputBar";
const BookingChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text: string, attachments: Attachment[]) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
      status: "sent",
      attachments: attachments.map(a => ({ ...a, type: a.type })),
    };
    setMessages(prev => [...prev, msg]);
    setIsTyping(true);
    // call your API, then setIsTyping(false) and append the reply
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInputBar onSend={handleSend} />
    </div>
  );
}
export default BookingChat;