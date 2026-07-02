import { useParams } from "react-router-dom";
import { useFetchEvent } from "../../components/helper";
import './EventDetails.css';



export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { event, error, isLoading } = useFetchEvent(eventId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }


  return (
    <div className="event-details-container">
      <h1>{event.title}</h1>

      <div className="event-details-info">
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Type:</strong> {event.eventType}</p>
        <p><strong>Address:</strong> {event.address}</p>
        <p><strong>Date & Time:</strong> {new Date(event.startDateTime).toLocaleString()} - {new Date(event.endDateTime).toLocaleString()}</p>
      </div>

      <div className="event-buttons">
        <button onClick={() => window.location.href = "/events"}>
          Back to Events
        </button>

        <button onClick={() => window.location.href = "/booking/" + event.eventId}>
          Book Tickets
        </button>
      </div>
    </div>
  );
}
