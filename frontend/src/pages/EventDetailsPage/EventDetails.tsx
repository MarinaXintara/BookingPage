// Source - https://stackoverflow.com/a/4293047
// Posted by Sandeep, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-01, License - CC BY-SA 3.0
import { useParams } from "react-router-dom";
import mockData from "../../components/mockData";
import './EventDetails.css';



export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = mockData.find((e) => String(e.eventId) === eventId);

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
