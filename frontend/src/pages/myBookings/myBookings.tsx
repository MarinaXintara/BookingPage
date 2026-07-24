import { fetchBookings } from './bookingApi';

export default async function GetBookings() {
    try {
        const bookings = await fetchBookings();
        return (<div>
            <h1>My Bookings</h1>
            <ul>
                {bookings.map((booking) => (
                    <li key={booking.id}>{booking.ticketTypeRef}</li>
                ))}
            </ul>
        </div>
        );
    }
    catch (error) {
        console.error("Error fetching my bookings:", error);
        throw error;
    }
}
