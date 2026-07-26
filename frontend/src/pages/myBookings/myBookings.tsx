import { useEffect, useState } from "react";
import { fetchBookings } from "./bookingApi";

export default function GetBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const data = await fetchBookings();
                setBookings(data);
            } catch (err) {
                console.error("Error fetching my bookings:", err);
                setError("Could not load bookings");
            }
        };

        loadBookings();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>My Bookings</h1>

            <ul>
                {bookings.map((booking) => (
                    <li key={booking.id}>
                        Ticket type: {booking.ticketTypeRef}
                    </li>
                ))}
            </ul>
        </div>
    );
}
