import { Link } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth";
import SearchPage from "./Search";

export default function EventPage() {
  const { user } = useAuth();
  const canCreateEvent = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Events</h1>
          <p>Search for an event and view its available tickets.</p>
        </div>
        {canCreateEvent ? (
          <Link className="button" to="/createEvent">Publish event</Link>
        ) : null}
      </header>
      <SearchPage />
    </main>
  );
}
