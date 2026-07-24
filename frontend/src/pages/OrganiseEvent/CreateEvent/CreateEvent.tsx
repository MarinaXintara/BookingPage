import { useState } from "react";

export default function CreateEvent() {
    const [message, setMessage] = useState("");

    const [ticketTypes, setTicketTypes] = useState([
        {
            name: "",
            price: 0,
            quantity: 0,
        },
    ]);

    const addTicketType = () => {
        setTicketTypes([
            ...ticketTypes,
            {
                name: "",
                price: 0,
                quantity: 0,
            },
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
            [field]:
                field === "price" || field === "quantity"
                    ? Number(value)
                    : value,
        };

        setTicketTypes(updatedTickets);
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("Submitting...");

        const formData = new FormData(event.currentTarget);

        const capacity = Number(formData.get("capacity"));

        const totalTickets = ticketTypes.reduce(
            (sum, ticket) => sum + ticket.quantity,
            0
        );

        if (totalTickets > capacity) {
            setMessage(
                "Total ticket quantity cannot exceed event capacity."
            );
            return;
        }

        const data = {
            title: formData.get("title"),
            category: formData.get("category"),
            eventType: formData.get("eventType"),
            venue: formData.get("venue"),
            address: formData.get("address"),
            city: formData.get("city"),
            country: formData.get("country"),
            startDateTime: formData.get("startDateTime"),
            endDateTime: formData.get("endDateTime"),
            capacity: capacity,
            description: formData.get("description"),

            // Ignore imageUrl for now
            ticketTypes: ticketTypes,
        };

        try {
            const response = await fetch(
                "http://localhost:8080/api/events/createEvent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                const createdEvent = await response.json();

                console.log(createdEvent);

                setMessage("Event created successfully!");

                event.currentTarget.reset();

                setTicketTypes([
                    {
                        name: "",
                        price: 0,
                        quantity: 0,
                    },
                ]);
            } else {
                const error = await response.text();
                console.error(error);
                setMessage("Failed to create event.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Could not connect to the backend.");
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "300px",
                    gap: "10px",
                }}
            >
                <label>Title:</label>
                <input type="text" name="title" required />

                <label>Category:</label>
                <input type="text" name="category" />

                <label>Event Type:</label>
                <input type="text" name="eventType" />

                <label>Venue:</label>
                <input type="text" name="venue" />

                <label>Address:</label>
                <input type="text" name="address" />

                <label>City:</label>
                <input type="text" name="city" />

                <label>Country:</label>
                <input type="text" name="country" />

                <label>Start Date Time:</label>
                <input type="datetime-local" name="startDateTime" />

                <label>End Date Time:</label>
                <input type="datetime-local" name="endDateTime" />

                <label>Capacity:</label>
                <input type="number" name="capacity" min="1" />

                <fieldset>
                    <legend>Ticket Types</legend>

                    {ticketTypes.map((ticket, index) => (
                        <div
                            key={index}
                            style={{
                                borderBottom: "1px solid #ccc",
                                marginBottom: "10px",
                                paddingBottom: "10px",
                            }}
                        >
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

                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                />

                <input
                    type="text"
                    name="imageUrl"
                    placeholder="Image URL"
                />

                <button type="submit">
                    Publish
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}