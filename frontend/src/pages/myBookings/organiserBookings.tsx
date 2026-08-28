import { useEffect, useState } from "react";
import { fetchOrganiserBookings, type Booking } from "./bookingApi";
import { fetchEvents, type Event } from "../EventPage/eventApi";

interface BookingRow extends Booking {
  event: Event | null;
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

export default function OrganiserBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([fetchOrganiserBookings(controller.signal), fetchEvents(controller.signal)])
      .then(([bookingData, events]) => {
        const eventByTicketType = new Map<number, Event>();

        events.forEach((event) => {
          event.ticketTypes.forEach((ticketType) => {
            eventByTicketType.set(ticketType.id, event);
          });
        });

        setBookings(bookingData.map((booking) => ({
          ...booking,
          event: eventByTicketType.get(booking.ticketType.id) ?? null,
        })));
      })
      .catch((loadError: unknown) => {
        if (!(loadError instanceof DOMException && loadError.name === "AbortError")) {
          setError(loadError instanceof Error ? loadError.message : "Could not load event bookings.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Event bookings</h1>
          <p>Reservations for events you organise.</p>
        </div>
      </header>

      {isLoading ? <p className="page-message">Loading bookings...</p> : null}
      {error ? <p className="page-message page-message--error" role="alert">{error}</p> : null}
      {!isLoading && !error && bookings.length === 0 ? (
        <p className="page-message">There are no bookings for your events yet.</p>
      ) : null}

      {!isLoading && !error && bookings.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Event title</th>
                <th scope="col">User ID</th>
                <th scope="col">User name</th>
                <th scope="col">Ticket</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
                <th scope="col">Event status</th>
                <th scope="col">Booking status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.event?.title ?? "Unavailable event"}</td>
                  <td>{booking.attendee.id}</td>
                  <th scope="row">{booking.attendee.firstName} {booking.attendee.lastName}</th>
                  <td>{booking.ticketType.name}</td>
                  <td>{booking.numberOfTickets}</td>
                  <td>{currencyFormatter.format(booking.totalCost)}</td>
                  <td>{booking.event?.status?.toLowerCase() ?? "unavailable"}</td>
                  <td className={`status status--${booking.bookingStatus.toLowerCase()}`}>
                    {booking.bookingStatus.toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
