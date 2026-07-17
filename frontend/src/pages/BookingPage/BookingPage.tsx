import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchEvent } from "../../components/helper";
import './BookingPage.css';

const Booking: React.FC = () => {

  // Get the eventId from the URL parameters
  const { eventId } = useParams<{ eventId: string }>();

  // Fetch the event item
  const { event, error: eventError, isLoading: eventIsLoading } = useFetchEvent(eventId);

  // State for selected ticket type and number of tickets
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState<number>(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedType = event?.ticketTypes.find(
    (type) => type.id === selectedTicketTypeId
  );

  if (!selectedType) {
    setMessage({
      type: "error",
      text: "Ticket type not found."
    });
    return;
  }


  if (numberOfTickets > selectedType.available) {
    setMessage({
      type: "error",
      text: "Not enough available tickets."
    });
    return;
  }


  const handleBook = async () => {
    setMessage(null);

    // Validation checks
    if (!selectedTicketTypeId) {
      setMessage({ type: "error", text: "Please select a ticket type." });
      return;
    }
    if (numberOfTickets <= 0) {
      setMessage({ type: "error", text: "Please select the number of tickets." });
      return;
    }

    const payload = { eventId: event?.eventId, ticketTypeId: selectedTicketTypeId, numberOfTickets };

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking.");
      }

      const booking = await response.json();

      setMessage({ type: "success", text: `Your booking is ${booking.bookingStatus.toLowerCase()}!` });
      setSelectedTicketTypeId(null);
      setNumberOfTickets(0);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventIsLoading) {
    return <div>Loading...</div>;
  }

  if (eventError) {
    return <div>{eventError}</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }
  if (event.ticketTypes)
    return (
      <>
        {message && (
          <p style={{ color: message.type === "success" ? "green" : "red" }}>
            {message.text}
          </p>
        )}

        <h1>Booking for: {event.title}</h1>
        <>
          <p>
            Select type of ticket:
            {/* Added value selection binding */}
            <select value={selectedTicketTypeId || ""} onChange={(e) => setSelectedTicketTypeId(e.target.value ? Number(e.target.value) : null)}>
              <option value="" >-- Select --</option>
              {event.ticketTypes.map((type) => (
                <option key={type.id} value={type.id} disabled={type.available === 0}>
                  {type.name} - {type.price}€
                </option>
              ))}
            </select>
          </p>

          <p>
            Select number of tickets:
            {/* Added value selection binding */}
            <select value={numberOfTickets} onChange={(e) => setNumberOfTickets(Number(e.target.value))} disabled={!selectedTicketTypeId}>
              <option value="">--Select-- </option>
              {event.ticketTypes.map((type) => (type.id === selectedTicketTypeId &&
                Array.from(
                  { length: type.available <= 50 ? type.available : 50 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  )
                )))}
            </select>
          </p>

          <div className="booking-buttons">
            <button onClick={() => window.location.href = "/events/" + event.eventId}>
              Back to Events
            </button>

            <button onClick={handleBook} disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>

          </div>
        </>
      </>
    );
};

export default Booking;