
import { useState } from 'react';

export default function CreateEvent() {

  const [message, setMessage] = useState('');


  const [ticketTypes, setTicketTypes] = useState([
    {
      name: "",
      price: 0,
      quantity: 0
    }
  ]);

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        price: 0,
        quantity: 0
      }
    ]);
  };
  const updateTicketType = (
    index: number,
    field: string,
    value: string | number
  ) => {

    const updatedTickets = [...ticketTypes];

    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: field === "quantity" || field === "price"
        ? Number(value)
        : value
    };

    setTicketTypes(updatedTickets);

  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // 1. Prevent the browser from reloading the page
    event.preventDefault();
    setMessage('Submitting...');

    // 2. Easily gather all form data without needing a separate state for every input
    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      title: formData.get("title"),
      capacity: Number(formData.get("capacity")),
      ticketTypes: ticketTypes
    };
    const totalTickets = ticketTypes.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    const capacity = Number(formData.get("capacity"));


    if (totalTickets > capacity) {
      setMessage(
        "Total ticket quantity cannot exceed event capacity."
      );
      return;
    }

    try {
      // 3. Send the data asynchronously to your backend
      const response = await fetch('http://localhost:8080/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Response from backend:', responseData);
        setMessage('Event created successfully!');
        (event.target as HTMLFormElement).reset(); // Clear the form after success
      } else {
        setMessage('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while connecting to the server.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>

        <label htmlFor="title">Title:</label>
        <input type="text" id="title" name="title" required />

        <label htmlFor="category">Category:</label>
        <input type="text" id="category" name="category" />

        <label htmlFor="eventType">Event Type:</label>
        <input type="text" id="eventType" name="eventType" />

        <label htmlFor="venue">Venue:</label>
        <input type="text" id="venue" name="venue" />

        <label htmlFor="address">Address:</label>
        <input type="text" id="address" name="address" />

        <label htmlFor="city">City:</label>
        <input type="text" id="city" name="city" />

        <label htmlFor="country">Country:</label>
        <input type="text" id="country" name="country" />

        <label htmlFor="startDateTime">Start Date Time:</label>
        <input type="datetime-local" id="startDateTime" name="startDateTime" />

        <label htmlFor="endDateTime">End Date Time:</label>
        <input type="datetime-local" id="endDateTime" name="endDateTime" />

        <label htmlFor="capacity">Capacity:</label>
        <input type="number" id="capacity" name="capacity" min="1" />


        <fieldset>

          <legend>Ticket Types</legend>

          {ticketTypes.map((ticket, index) => (

            <div key={index}>

              <label>Name:</label>
              <input
                value={ticket.name}
                onChange={(e) =>
                  updateTicketType(index, "name", e.target.value)
                }
              />


              <label>Price:</label>
              <input
                type="number"
                value={ticket.price}
                onChange={(e) =>
                  updateTicketType(index, "price", e.target.value)
                }
              />


              <label>Quantity:</label>
              <input
                type="number"
                value={ticket.quantity}
                onChange={(e) =>
                  updateTicketType(index, "quantity", e.target.value)
                }
              />

            </div>

          ))}


          <button
            type="button"
            onClick={addTicketType}
          >
            + Add Ticket Type
          </button>


        </fieldset>

        <input type="text" id="description" name="description" placeholder="Description" />
        <input type="text" id="imageUrl" name="imageUrl" placeholder="Image URL" />

        <button type="submit">Publish</button>
      </form>

      {/* Feedback message for the user */}
      {message && <p>{message}</p>}
    </div>
  );
}

