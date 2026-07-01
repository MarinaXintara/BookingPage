//Search

import { useEffect, useState } from 'react';
import GridCard from './EventGridCard';
import { fetchEvents, type Event } from './eventApi';

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
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
    const controller = new AbortController();

    fetchEvents(controller.signal)
      .then((events) => {
        setData(events);
        console.log('Data fetched successfully');
      })
      .catch((err) => console.error('Error fetching events:', err));

    return () => controller.abort();
  }, []);

  console.log('Fetched events:', data);

  return (
    <div>
      <Search {...{ search, setSearch }} />
      <EventGrid
        {...{
          items: search
            ? data.filter((item) =>
              normalizeText(item.title).includes(normalizeText(search)) ||
              normalizeText(item.category).includes(normalizeText(search)) ||
              normalizeText(item.address).includes(normalizeText(search))
            )
            : data,
        }}
      />
    </div>
  );
}
