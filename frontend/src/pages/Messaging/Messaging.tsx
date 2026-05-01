
import { useState } from "react";

const organisers = [
  { id: "organiser-1", name: "Πασχαλίδης" },
  { id: "organiser-2", name: "Μέγαρο Μουσικής" },
  { id: "organiser-3", name: "Jazz Bar" },
  { id: "organiser-4", name: "Κεραμεική" },
]

const Messaging: React.FC = () => {

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [createNewMessage, setCreateNewMessage] = useState(false);
  const [recipient, setRecipient] = useState(organisers[0].id);
  const [messageContent, setMessageContent] = useState("");
  const [replyToRecipient, setReplyToRecipient] = useState("");
  const mockInbox = [
    { id: "inbox1", name: organisers[0].name, message: "Hi, I have a question about my booking." },
    { id: "2", name: organisers[3].name, message: "Can I change my reservation?", unread: true },
  ];
  const mockOutbox = [
    { id: "outbox1", name: organisers[1].name, message: "Sure, what do you need help with?" },
    { id: "outbox2", name: organisers[2].name, message: "Yes, you can change it up to 24 hours before." },
  ];

  function MessageDisplay({ showReplyButton }: { showReplyButton?: boolean }) {
    if (selectedMessage) {
      return (
        <div>
          <div> {selectedMessage.name}</div>
          <div>{selectedMessage.message}</div>
          {showReplyButton && <button onClick={() => {setCreateNewMessage(true); setReplyToRecipient(selectedMessage.name)}}>Reply</button>}
        </div>)

    }
  }

  const NewMessage = () => {
    return (
      
      <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
        {replyToRecipient? <p>Reply to {replyToRecipient}</p>:
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="organisers">Choose organiser:</label>
          <select name="organisers" id="organisers" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
            {organisers.map((organiser) => (
              <option key={organiser.id} value={organiser.id}>
                {organiser.name}
              </option>
            ))}
          </select>
        </div>}
        <input type="text" placeholder="Enter message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
      </div>
    )
  }
  function MessageBox({ message, isSelected }: { message: any; isSelected: boolean }) {
    return (
      <div
        key={message.id}
        style={{ backgroundColor: isSelected ? "lightblue" : "", padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => { setSelectedMessage(message); setCreateNewMessage(false) }}
      >
        {message.unread && <span style={{ color: "red", fontSize: "20px" }}>●</span>}
        <strong>{message.name}</strong>
        <p>{message.message}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Messaging</h1>
      <button onClick={() => setCreateNewMessage(true)}>New Message</button>

      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>
          <div style={{ width: "400px", }}>
            <h2>Inbox</h2>
            {mockInbox.map(message => <MessageBox message={message} isSelected={selectedMessage?.id === message.id} />)}
          </div>
          <div style={{ width: "400px" }}>
            <h2>Outbox</h2>
            {/* List of conversations */}
            {mockOutbox.map(message => <MessageBox message={message} isSelected={selectedMessage?.id === message.id} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "400px" }}>
          {createNewMessage ? <NewMessage /> : <MessageDisplay showReplyButton={mockInbox.some((msg) => msg.id === selectedMessage?.id)} />}
        </div>
      </div>
    </div>
  );
}

export default Messaging;