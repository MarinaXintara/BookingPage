import { useParams } from "react-router-dom";
import { useFetchEvent } from "../../components/helper";
import './EventDetails.css';
import EventMap from "../../OpenStreetMap/loadMap";



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

  console.log(event.ticketTypes);
  console.log(event.geoLocation);

  return (
    <div className="event-details-container">
      <h1>{event.title}</h1>

      <div className="event-details-info">
        <p><strong>Title:</strong> {event.title}</p>
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Address:</strong> {event.address}</p>
        <EventMap latitude={event.geoLocation.latitude} longitude={event.geoLocation.longitude} title={event.title} />
        <p><strong>Date & Time:</strong> {new Date(event.startDateTime).toLocaleString()} - {new Date(event.endDateTime).toLocaleString()}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Tickets:</strong></p>
        {event.ticketTypes && event.ticketTypes.length > 0 ? (
          event.ticketTypes.map((ticketType) => (
            <div key={ticketType.id}>
              <p>
                <strong>Type:</strong> {ticketType.name}
              </p>

              <p>
                <strong>Price:</strong>{" "}
                {Number(ticketType.price).toFixed(2)}€
              </p>
            </div>
          ))
        ) : (
          <p>No tickets available.</p>
        )}

        <div className="event-buttons">
          <button onClick={() => window.location.href = "/events"}>
            Back to Events
          </button>

          <button onClick={() => window.location.href = "/booking/" + event.eventId}>
            Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
