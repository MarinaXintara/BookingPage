import { useEffect, useState } from "react";

const Booking: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState<number>(0);
  const [loadingEventId, setLoadingEventId] = useState<number | null>(null);
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

    fetch(`http://localhost:8080/api/ticket_types?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => setTicketTypes(data))
      .catch(() => setMessage({ type: "error", text: "Error fetching ticket types" }));
  };

  const handleBook = async () => {
    setMessage(null);

    if (!selectedTicketTypeId) {
      setMessage({ type: "error", text: "Παρακαλώ επίλεξε τύπο εισιτηρίου." });
      return;
    }
    if (numberOfTickets <= 0) {
      setMessage({ type: "error", text: "Παρακαλώ επίλεξε αριθμό εισιτηρίων." });
      return;
    }

    const payload = {
      eventId: selectedEventId,
      ticketTypeId: selectedTicketTypeId,
      numberOfTickets,
    };

    try {
      setLoadingEventId(selectedEventId);

      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Αποτυχία κράτησης.");

      setMessage({ type: "success", text: "Η κράτηση ολοκληρώθηκε! 🎉" });
      setSelectedEventId(null);
      setSelectedTicketTypeId(null);
      setTicketTypes([]);
      setNumberOfTickets(0);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Κάτι πήγε στραβά." });
    } finally {
      setLoadingEventId(null);
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
        const isLoading = loadingEventId === event.id;
        return (
          <div key={event.id}>
            <h3>{event.name}</h3>
            <button onClick={() => handleSelectEvent(event.id)} disabled={isLoading}>
              {isLoading ? "Γίνεται κράτηση..." : "Book"}
            </button>
          </div>
        );
      })}

      {selectedEventId && (
        <>
          <p>
            Select type of ticket:
            <select onChange={(e) => setSelectedTicketTypeId(Number(e.target.value))}>
              <option value="">-- Επίλεξε --</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.price}€ ({type.available} διαθέσιμα)
                </option>
              ))}
            </select>
          </p>

          <p>
            Select number of tickets:
            <select onChange={(e) => setNumberOfTickets(Number(e.target.value))}>
              <option value="0">-- Επίλεξε --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </p>

          <button onClick={handleBook} disabled={!!loadingEventId}>
            {loadingEventId ? "Γίνεται κράτηση..." : "Confirm Book"}
          </button>
        </>
      )}
    </>
  );
};

export default Booking;