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
  ticketTypes: TicketType[];
}

interface TicketType {
  id: number;
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
  ticketTypes?: TicketType[];
}

const API_URL = 'http://localhost:8080/api/events';

function toEvent(event: BackendEvent): Event {

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
    ticketTypes: event.ticketTypes ?? [],
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
