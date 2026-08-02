import { Link } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth.ts";

export function Home() {
  const { user } = useAuth();

  return (
    <main className="page page--narrow">
      <header className="page-header">
        <div>
          <h1>Welcome, {user?.firstName}</h1>
          <p>{user?.email}</p>
        </div>
      </header>
      <section className="panel">
        <p>Browse available events or review your existing bookings.</p>
        <div className="page-actions">
          <Link className="button" to="/events">
            Browse events
          </Link>
          <Link className="button button--secondary" to="/myBookings">
            My bookings
          </Link>
        </div>
      </section>
    </main>
  );
}
