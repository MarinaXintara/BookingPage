import { useEffect, useState } from "react";
import { fetchOrganiserBookings, type Booking } from "./bookingApi";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

export default function OrganiserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchOrganiserBookings(controller.signal)
      .then(setBookings)
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
                <th scope="col">Ticket</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <th scope="row">{booking.ticketType.name}</th>
                  <td>{booking.numberOfTickets}</td>
                  <td>{currencyFormatter.format(booking.totalCost)}</td>
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
