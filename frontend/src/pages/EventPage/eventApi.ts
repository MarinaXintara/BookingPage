export interface Event {
  eventId: string;
  title: string;
  category: string;
  eventType: string;
  address: string;
  geoLocation: { lat: number; lng: number };
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  ticketType: string;
  booking: { available: number };
  priceTicket: number;
}

interface BackendTicketType {
  name: string;
  price: number;
  available: number;
}

interface BackendEvent {
  id: number;
  title: string;
  category: string;
  eventType: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  ticketTypes?: BackendTicketType[];
}

const API_URL = 'http://localhost:8080/api/events';

function toEvent(event: BackendEvent): Event {
  const firstTicketType = event.ticketTypes?.[0];

  return {
    eventId: String(event.id),
    title: event.title,
    category: event.category,
    eventType: event.eventType,
    address: event.address,
    geoLocation: {
      lat: event.latitude ?? 0,
      lng: event.longitude ?? 0,
    },
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    capacity: event.capacity,
    ticketType: firstTicketType?.name ?? 'General Admission',
    booking: {
      available: firstTicketType?.available ?? event.capacity,
    },
    priceTicket: firstTicketType?.price ?? 0,
  };
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchEvents(signal?: AbortSignal): Promise<Event[]> {
  const events = await fetchJson<BackendEvent[]>(API_URL, signal);
  return events.map(toEvent);
}

export async function fetchEvent(eventId: string, signal?: AbortSignal): Promise<Event> {
  const event = await fetchJson<BackendEvent>(`${API_URL}/${eventId}`, signal);
  return toEvent(event);
}
