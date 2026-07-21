import { useState, useEffect } from 'react';

// Υποθέτουμε ότι το component παίρνει το ID της εκδήλωσης που θέλουμε να αλλάξουμε
export default function EditEvent({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState('');
  
  // Εδώ θα αποθηκεύσουμε τα παλιά δεδομένα που θα έρθουν από το backend
  const [eventData, setEventData] = useState<any>(null);

  // ΒΗΜΑ 1: Ζητάμε τα δεδομένα της εκδήλωσης όταν ανοίγει η σελίδα
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Κάνουμε GET request στο συγκεκριμένο ID (π.χ. /api/events/5)
        const response = await fetch(`http://localhost:8080/api/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data); // Αποθηκεύουμε τα δεδομένα στο state
        } else {
          setMessage('No event found with the given ID.');
        }
      } catch (error) {
        setMessage('Error connecting to the server.');
      }
    };

    fetchEvent();
  }, [eventId]); // Το useEffect ξανατρέχει αν αλλάξει το eventId

  // ΒΗΜΑ 2: Η συνάρτηση που τρέχει όταν πατάμε "Αποθήκευση"
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Saving changes...');

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Στέλνουμε τα νέα δεδομένα στο ΙΔΙΟ url, αλλά με μέθοδο PUT
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: 'PUT', // Η μέθοδος PUT (ή PATCH) σημαίνει "Ενημέρωση/Αλλαγή"
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Event is succesfully saved!');
      } else {
        setMessage('Failed to update event. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('There was a problem connecting to the server.');
    }
  };

  // Όσο περιμένουμε να φορτώσουν τα δεδομένα, δείχνουμε ένα μήνυμα
  if (!eventData) {
    return <p>Loading event data...</p>;
  }

  return (
    <div>
     
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>
        
        <label htmlFor="title">Title:</label>
        {/* Χρησιμοποιούμε το defaultValue για να γεμίσουμε το πεδίο με τον υπάρχοντα τίτλο */}
        <input type="text" id="title" name="title" defaultValue={eventData.title} required />

        <label htmlFor="category">Category:</label>
        <input type="text" id="category" name="category" defaultValue={eventData.category} />

        <label htmlFor="capacity">Capacity:</label>
        <input type="number" id="capacity" name="capacity" defaultValue={eventData.capacity} min="1" />

        <button type="submit">Save Changes</button>
      </form>
      
      {message && <p><strong>{message}</strong></p>}
    </div>
  );
}