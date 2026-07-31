import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


export default function EditEvent() {
  const { eventId } = useParams();

  const [message, setMessage] = useState('');


  const [eventData, setEventData] = useState({
    title: "",
    category: "",
    capacity: "1"
  })

  //Loading event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/events/${eventId}`
        );

        const data = await response.json();

        setEventData(data);
      } catch (err) {
        console.error(err);
        setMessage("Could not load event.");
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();


    const data = {
      id: Number(eventId),
      title: eventData.title,
      category: eventData.category,
      capacity: Number(eventData.capacity),
    };

    try {
      const response = await fetch(
        "http://localhost:8080/api/events/editEvent",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setMessage("Event updated successfully!");
      } else {
        setMessage("Failed to update event.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Could not connect to backend.");
    }
  };
  if (!eventData) {
    return <p>Loading...</p>;
  }

  return (
    <div>


      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>

        <label htmlFor="title">Title:</label>
        <input type="text" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value, })}
        />
        <input
          type="text"
          value={eventData.category}
          onChange={(e) =>
            setEventData({
              ...eventData,
              category: e.target.value,
            })
          }
        />
        <input
          type="number"
          value={eventData.capacity}
          min="1"
          onChange={(e) =>
            setEventData({
              ...eventData,
              capacity: (e.target.value),
            })
          }
        />

        <button type="submit">Save Changes</button>
      </form>

      {message && <p><strong>{message}</strong></p>}
    </div>
  );
}