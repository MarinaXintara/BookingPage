import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents, type Event } from "../EventPage/eventApi";
import {
  fetchBookings,
  type Booking,
  type BookingStatus,
} from "./bookingApi";
import "./myBookings.css";

interface BookingViewModel extends Booking {
  event: Event | null;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : dateFormatter.format(date);
}

function formatCurrency(value: number) {
  return Number.isFinite(value)
    ? currencyFormatter.format(value)
    : "Not available";
}

function formatStatus(status: BookingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function eventStartTime(booking: BookingViewModel) {
  if (!booking.event) return Number.POSITIVE_INFINITY;

  const startTime = new Date(booking.event.startDateTime).getTime();
  return Number.isNaN(startTime) ? Number.POSITIVE_INFINITY : startTime;
}

function BookingCard({ booking }: { booking: BookingViewModel }) {
  const statusClass = booking.bookingStatus.toLowerCase();

  return (
    <article className="booking-card">
      <header className="booking-card__header">
        <div>
          <p className="booking-card__reference">Booking #{booking.id}</p>
          <h3>{booking.event?.title ?? "Event unavailable"}</h3>
        </div>

        <span
          className={`booking-status booking-status--${statusClass}`}
          aria-label={`Booking status: ${formatStatus(booking.bookingStatus)}`}
        >
          {formatStatus(booking.bookingStatus)}
        </span>
      </header>

      <dl className="booking-details">
        <div>
          <dt>Event date</dt>
          <dd>{formatDate(booking.event?.startDateTime)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{booking.event?.address || "Not available"}</dd>
        </div>
        <div>
          <dt>Ticket</dt>
          <dd>{booking.ticketType.name}</dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>{booking.numberOfTickets}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatCurrency(booking.totalCost)}</dd>
        </div>
        <div>
          <dt>Booked on</dt>
          <dd>{formatDate(booking.time)}</dd>
        </div>
      </dl>

      {booking.event ? (
        <Link
          className="booking-card__action"
          to={`/events/${booking.event.eventId}`}
        >
          View event
        </Link>
      ) : (
        <p className="booking-card__unavailable">
          Event details are no longer available.
        </p>
      )}
    </article>
  );
}

function BookingSection({
  title,
  bookings,
}: {
  title: string;
  bookings: BookingViewModel[];
}) {
  if (bookings.length === 0) return null;

  const headingId = `${title.toLowerCase().replace(/\s+/g, "-")}-bookings-heading`;

  return (
    <section className="bookings-section" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <div className="bookings-grid">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </section>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pageLoadedAt] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      setIsLoading(true);
      setError(null);

      try {
        const [bookingData, events] = await Promise.all([
          fetchBookings(controller.signal),
          fetchEvents(controller.signal),
        ]);

        const eventByTicketTypeId = new Map<number, Event>();

        for (const event of events) {
          for (const ticketType of event.ticketTypes) {
            eventByTicketTypeId.set(ticketType.id, event);
          }
        }

        setBookings(
          bookingData.map((booking) => ({
            ...booking,
            event: eventByTicketTypeId.get(booking.ticketType.id) ?? null,
          }))
        );
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your bookings."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();
    return () => controller.abort();
  }, [retryCount]);

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.bookingStatus !== "CANCELLED" &&
        booking.event !== null &&
        eventStartTime(booking) >= pageLoadedAt
    )
    .sort((a, b) => eventStartTime(a) - eventStartTime(b));

  const pastBookings = bookings
    .filter(
      (booking) =>
        booking.bookingStatus !== "CANCELLED" &&
        booking.event !== null &&
        eventStartTime(booking) < pageLoadedAt
    )
    .sort((a, b) => eventStartTime(b) - eventStartTime(a));

  const unavailableBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus !== "CANCELLED" && booking.event === null
  );

  const cancelledBookings = bookings
    .filter((booking) => booking.bookingStatus === "CANCELLED")
    .sort((a, b) => eventStartTime(b) - eventStartTime(a));

  return (
    <main className="my-bookings">
      <header className="my-bookings__header">
        <div>
          <h1>My Bookings</h1>
          <p>Review your upcoming events and booking history.</p>
        </div>
        {!isLoading && !error && bookings.length > 0 && (
          <span className="my-bookings__count">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        )}
      </header>

      {isLoading && (
        <section className="bookings-message" aria-live="polite">
          <div className="bookings-spinner" aria-hidden="true" />
          <h2>Loading your bookings</h2>
          <p>This should only take a moment.</p>
        </section>
      )}

      {!isLoading && error && (
        <section className="bookings-message bookings-message--error" role="alert">
          <h2>We couldn&apos;t load your bookings</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </section>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <section className="bookings-message">
          <h2>No bookings yet</h2>
          <p>When you reserve tickets, they will appear here.</p>
          <Link className="bookings-message__action" to="/events">
            Browse events
          </Link>
        </section>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="bookings-content">
          <BookingSection title="Upcoming" bookings={upcomingBookings} />
          <BookingSection title="Past" bookings={pastBookings} />
          <BookingSection
            title="Event unavailable"
            bookings={unavailableBookings}
          />
          <BookingSection title="Cancelled" bookings={cancelledBookings} />
        </div>
      )}
    </main>
  );
}
