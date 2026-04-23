import React from 'react';
import { useNavigate } from "react-router-dom";

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

interface GridCardProps {
  event: Event;
}


const GridCard: React.FC<GridCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      onClick={() => navigate ("/events/" + event.eventId)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}

      style={
        isHovered ? { border: '1px solid #007BFF', borderRadius: '8px', overflow: 'hidden', maxWidth: '540px', marginBottom: '1rem', cursor: 'pointer' } :
          {
            border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', maxWidth: '540px', marginBottom: '1rem'
          }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
          <img
            src="https://media.geeksforgeeks.org/wp-content/cdn-uploads/20190710102234/download3.png"
            style={isHovered ? { scale: 1.05, width: '100%', height: 'auto', borderRadius: '4px' } : { width: '100%', height: 'auto', borderRadius: '4px' }}
            alt="Event"

          />
        </div>
        <div style={{ flex: 1, padding: '1rem' }}>
          <h5 style={isHovered ? { color: '#943444', fontSize: 14 } : {}}>{event.title}</h5>
          <p>{event.category} - {event.eventType}</p>
          <p>{event.address}</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {new Date(event.startDateTime).toLocaleString()}
          </p>
          <p>Price: €{event.priceTicket}</p>
        </div>
      </div>
    </div >
  );
};

export default GridCard;