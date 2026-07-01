import { useEffect, useState } from "react";

// 1. Defined explicit interfaces instead of "any"
interface EventItem { id: number; name: string; }
interface TicketType { id: number; name: string; price: number; available: number; }

const Booking: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState<number>(0);
  
  // Cleaned up separate loading states
  const [fetchingTicketsForId, setFetchingTicketsForId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setMessage({ type: "error", text: "Error fetching events" }));
  }, []);

  const handleSelectEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setSelectedTicketTypeId(null);
    setTicketTypes([]);
    setMessage(null);
    setFetchingTicketsForId(eventId); // Track loading for this specific event list item

    fetch(`http://localhost:8080/api/ticket_types?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => setTicketTypes(data))
      .catch(() => setMessage({ type: "error", text: "Error fetching ticket types" }))
      .finally(() => setFetchingTicketsForId(null));
  };

  const handleBook = async () => {
    setMessage(null);

    // Tightened up validation
    if (!selectedEventId || !selectedTicketTypeId) {
      setMessage({ type: "error", text: "Please select an event and a ticket type." });
      return;
    }
    if (numberOfTickets <= 0) {
      setMessage({ type: "error", text: "Please select the number of tickets." });
      return;
    }

    const payload = { eventId: selectedEventId, ticketTypeId: selectedTicketTypeId, numberOfTickets };

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to book.");

      setMessage({ type: "success", text: "Booking completed!" });
      setSelectedEventId(null);
      setSelectedTicketTypeId(null);
      setTicketTypes([]);
      setNumberOfTickets(0);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {message && (
        <p style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </p>
      )}

      {events.map((event) => {
        const isEventLoading = fetchingTicketsForId === event.id;
        return (
          <div key={event.id}>
            <h3>{event.name}</h3>
            <button onClick={() => handleSelectEvent(event.id)} disabled={isEventLoading || isSubmitting}>
              {isEventLoading ? "Loading Tickets..." : "Select"}
            </button>
          </div>
        );
      })}

      {selectedEventId && (
        <>
          <p>
            Select type of ticket:
            {/* Added value selection binding */}
            <select value={selectedTicketTypeId || ""} onChange={(e) => setSelectedTicketTypeId(Number(e.target.value) || null)}>
              <option value="">-- Select --</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.price}€ ({type.available} available)
                </option>
              ))}
            </select>
          </p>

          <p>
            Select number of tickets:
            {/* Added value selection binding */}
            <select value={numberOfTickets} onChange={(e) => setNumberOfTickets(Number(e.target.value))}>
              <option value="0">-- Select --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </p>

          <button onClick={handleBook} disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Confirm Book"}
          </button>
        </>
      )}
    </>
  );
};

export default Booking;