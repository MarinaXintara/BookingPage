import { Link } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth";

const roleLabels = {
  ADMIN: "Administrator",
  ORGANIZER: "Organizer",
  USER: "Attendee",
} as const;

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <main className="page page--narrow"><p className="page-message">Loading profile...</p></main>;
  if (!user) return <main className="page page--narrow"><p className="page-message page-message--error">Profile unavailable.</p></main>;

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <main className="page page--narrow">
      <header className="page-header">
        <div><h1>{fullName}</h1><p>{roleLabels[user.role]}</p></div>
      </header>
      <section className="panel">
        <h2>Account details</h2>
        <dl className="details-list">
          <div><dt>Full name</dt><dd>{fullName}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
          <div><dt>Account type</dt><dd>{roleLabels[user.role]}</dd></div>
          <div><dt>Account ID</dt><dd>{user.id}</dd></div>
        </dl>
        <div className="page-actions">
          <Link className="button" to="/myBookings">My bookings</Link>
          <Link className="button button--secondary" to="/events">Browse events</Link>
        </div>
      </section>
    </main>
  );
}
