import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEvent, type Event } from "../EventPage/eventApi";
import './EventDetails.css';



export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError('Event not found');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    fetchEvent(eventId, controller.signal)
      .then((event) => {
        setEvent(event);
        setError(null);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching event:', error);
          setError('Event not found');
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [eventId]);

  if (isLoading) {
    return <div>Loading event...</div>;
  }

  if (error || !event) {
    return <div>{error ?? 'Event not found'}</div>;
  }


  return (
    <div className="event-details-container">
      <h1>{event.title}</h1>

      <div className="event-details-info">
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Type:</strong> {event.eventType}</p>
        <p><strong>Address:</strong> {event.address}</p>
        <p><strong>Date & Time:</strong> {new Date(event.startDateTime).toLocaleString()} - {new Date(event.endDateTime).toLocaleString()}</p>
        <p><strong>Tickets Available:</strong> {event.booking.available}</p>
        <p><strong>Ticket Price:</strong> €{event.priceTicket}</p>
      </div>
      <div className="event-buttons">
        <button onClick={() => window.location.href = "/events"}>
          Back to Events
        </button>

        <button onClick={() => window.location.href = "/booking"}>
          Book Tickets
        </button>
      </div>
    </div>
  );
}
