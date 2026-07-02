import { useEffect, useState } from "react";
import { fetchEvent, type Event } from "../pages/EventPage/eventApi";

export function useFetchEvent(eventId?: string) {
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) {
            setError('Event not found');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchEvent(eventId)
            .then((data: Event) => {
                setEvent(data);
                setError(null);
            })
            .catch(() => {
                setError('Failed to fetch event details');
                setEvent(null);
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [eventId]);

    return { event, error, isLoading };
}

