import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <h1>Welcome to BookIT</h1>
      <p>You can search here your favourite event.</p>
      <div className="welcome-actions">
        <Link className="button" to="/events">
          Search events
        </Link>
        <Link className="button button--secondary" to="/register">
          Register
        </Link>
        <Link className="button button--secondary" to="/login">
          Login
        </Link>
      </div>
    </main>
  );
}
