
import { useState } from 'react';

export default function CreateEvent() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // 1. Prevent the browser from reloading the page
    event.preventDefault();
    setMessage('Submitting...');

    // 2. Easily gather all form data without needing a separate state for every input
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      // 3. Send the data asynchronously to your backend
      const response = await fetch('http://localhost:8080/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Response from backend:', responseData);
        setMessage('Event created successfully!');
        (event.target as HTMLFormElement).reset(); // Clear the form after success
      } else {
        setMessage('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while connecting to the server.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>
        <label htmlFor="id">Event ID:</label>
        <input type="text" id="id" name="id" required />

        <label htmlFor="title">Title:</label>
        <input type="text" id="title" name="title" required />

        <label htmlFor="category">Category:</label>
        <input type="text" id="category" name="category" />

        <label htmlFor="eventType">Event Type:</label>
        <input type="text" id="eventType" name="eventType" />

        <label htmlFor="address">Address:</label>
        <input type="text" id="address" name="address" />

        <label htmlFor="geoLocation">Geo Location:</label>
        <input type="text" id="geoLocation" name="geoLocation" />

        <label htmlFor="startDateTime">Start Date Time:</label>
        <input type="datetime-local" id="startDateTime" name="startDateTime" />

        <label htmlFor="endDateTime">End Date Time:</label>
        <input type="datetime-local" id="endDateTime" name="endDateTime" />

        <label htmlFor="capacity">Capacity:</label>
        <input type="number" id="capacity" name="capacity" min="1" />

        <button type="submit">Create Event</button>
      </form>
      
      {/* Feedback message for the user */}
      {message && <p>{message}</p>}
    </div>
  );
}

