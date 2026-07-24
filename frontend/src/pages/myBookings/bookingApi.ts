export interface Booking{
  id: number;
  attendeeUserId: number;
  time: string;
  ticketTypeRef: number;
  numberOfTickets: number;
  totalCost: number;
  bookingStatus: string;

}

export async function fetchBookings(): Promise<Booking[]> {
  const response = await fetch(`http://localhost:8080/api/Booking`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

export async function fetchBooking(Id: string): Promise<Booking> {
  const response = await fetch(`http://localhost:8080/api/Booking/${Id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch booking");
  }

  return response.json();
} 