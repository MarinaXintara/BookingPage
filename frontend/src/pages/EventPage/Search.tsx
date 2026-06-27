//Search

import { useEffect, useState } from 'react';
// import mockData from './mockData';
import GridCard from './EventGridCard';

interface Event {
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

export function Search({ search, setSearch }: { search: string; setSearch: (value: string) => void }) {
  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="px-2 py-1 border rounded"
    />
  );
}

function EventGrid({ items }: { items: Event[] }) {
  if (items.length === 0) return <div>No result.</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', margin: '1rem' }}>
      {items.map((item) => (
        <GridCard key={item.eventId} event={item} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Event[]>([]);

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Error fetching events:', err));
  }, []);

  console.log('Fetched events:', data);

  return (
    <div>
      <Search {...{ search, setSearch }} />
      <EventGrid
        {...{
          items: search
            ? data.filter((item) =>
              item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) ||
              item.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) ||
              item.address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
            )
            : data,
        }}
      />
    </div>
  );
}