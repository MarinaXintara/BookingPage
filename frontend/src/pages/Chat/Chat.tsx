
import { useState } from "react";
import type { Attachment } from "./ChatInputBar";
import type { Message } from "./MessageList";
const BookingChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const mockInbox = [
    { id: "1", name: "Alice", lastMessage: "Hi, I have a question about my booking." },
    { id: "2", name: "Bob", lastMessage: "Can I change my reservation?" },
  ];
  const mockOutbox = [
    { id: "1", name: "Alice", lastMessage: "Sure, what do you need help with?" },
    { id: "2", name: "Bob", lastMessage: "Yes, you can change it up to 24 hours before." },
  ];


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

    // setIsTyping(true);
    // call your API, then setIsTyping(false) and append the reply
  };

  const MessageDisplay = () => {
    if (selectedMessage) {
      return (<div><div> {selectedMessage.name}</div>
        <div>{selectedMessage.lastMessage}</div></div>)

    }
  }
  return (
    <div>
      <h1>Booking Chat</h1>

      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>
          <div style={{ width: "200px", }}>
            <h2>Inbox</h2>
            {/* List of conversations */}
            {mockInbox.map(message => <div key={message.id} style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => setSelectedMessage(message)}>
              <strong>{message.name}</strong>
              <p>{message.lastMessage}</p>
            </div>)}
          </div>
          <div style={{ width: "200px" }}>
            <h2>Outbox</h2>
            {/* List of conversations */}
            {mockOutbox.map(message => <div key={message.id} style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => setSelectedMessage(message)}>
              <strong>{message.name}</strong>
              <p>{message.lastMessage}</p>
            </div>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "400px" }}>
          <MessageDisplay />
        </div>
      </div>
    </div>
  );
}
export default BookingChat;