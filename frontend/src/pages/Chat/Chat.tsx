
import { useState } from "react";
const BookingChat: React.FC = () => {

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [createNewMessage, setCreateNewMessage] = useState(false);
  const mockInbox = [
    { id: "1", name: "Alice", lastMessage: "Hi, I have a question about my booking." },
    { id: "2", name: "Bob", lastMessage: "Can I change my reservation?" },
  ];
  const mockOutbox = [
    { id: "1", name: "Alice", lastMessage: "Sure, what do you need help with?" },
    { id: "2", name: "Bob", lastMessage: "Yes, you can change it up to 24 hours before." },
  ];

  const MessageDisplay = () => {
    if (selectedMessage) {
      return (<div><div> {selectedMessage.name}</div>
        <div>{selectedMessage.lastMessage}</div></div>)

    }
  }

  const NewMessage = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
        <div style= {{ marginBottom: "20px" }}>
          <label htmlFor="organisers">Choose organiser:</label>
          <select name="organisers" id="organisers">
            <option value="Πασχαλίδης">Πασχαλίδης</option>
            <option value="Μέγαρο Μουσικής">Μέγαρο Μουσικής</option>
            <option value="Jazz Bar">Jazz Bar</option>
            <option value="Κεραμεική">Κεραμεική</option>
          </select>
        </div>
        <input type="text" placeholder="Enter message..." />
      </div>
    )
  }


  return (
    <div>
      <h1>Booking Chat</h1>
      <button onClick={() => setCreateNewMessage(true)}>New Message</button>

      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>
          <div style={{ width: "400px", }}>
            <h2>Inbox</h2>
            {/* List of conversations */}
            {mockInbox.map(message => <div key={message.id} style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => setSelectedMessage(message)}>
              <strong>{message.name}</strong>
              <p>{message.lastMessage}</p>
            </div>)}
          </div>
          <div style={{ width: "400px" }}>
            <h2>Outbox</h2>
            {/* List of conversations */}
            {mockOutbox.map(message => <div key={message.id} style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => setSelectedMessage(message)}>
              <strong>{message.name}</strong>
              <p>{message.lastMessage}</p>
            </div>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "400px" }}>
          {createNewMessage ? <NewMessage /> : <MessageDisplay />}
        </div>
      </div>
    </div>
  );
}

export default BookingChat;