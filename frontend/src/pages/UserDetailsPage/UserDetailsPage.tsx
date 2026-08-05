import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { fetchUser, type User } from "../UsersPage/userApi";
import {
  type AccountStatus,
  formatRegistrationDate,
  getRoleLabel,
  getStatusLabel,
  getUserMetadata,
  updateDemoUserStatus,
} from "../UsersPage/userPresentation";

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState(userId ? "" : "Missing user id.");
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [registeredAt, setRegisteredAt] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    fetchUser(userId)
      .then((result) => {
        if (!ignore) {
          const metadata = getUserMetadata(result.id);
          setUser(result);
          setStatus(metadata.status);
          setRegisteredAt(metadata.registeredAt);
        }
      })
      .catch(() => {
        if (!ignore) setError("Could not load user.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => { ignore = true; };
  }, [userId]);

  function changeStatus(nextStatus: AccountStatus) {
    if (!user) return;

    updateDemoUserStatus(user.id, nextStatus);
    setStatus(nextStatus);
    setStatusMessage("Status updated for this demo. It will reset when the page is reloaded.");
  }

  return (
    <main className="page page--narrow">
      <Link to="/users">Back to users</Link>
      {isLoading ? <p className="page-message">Loading user...</p> : null}
      {error ? <p className="page-message page-message--error" role="alert">{error}</p> : null}
      {!isLoading && !error && !user ? <p className="page-message">User not found.</p> : null}
      {user ? (
        <article className="panel">
          <header className="page-header">
            <div>
              <h1>{user.firstName} {user.lastName}</h1>
              <p>{getRoleLabel(user.role)}</p>
            </div>
          </header>
          <dl className="details-list">
            <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{user.phoneNumber ?? "Not provided"}</dd></div>
            <div><dt>Status</dt><dd>{status ? <span className={`status-badge status-badge--${status.toLowerCase()}`}>{getStatusLabel(status)}</span> : "Not available"}</dd></div>
            <div><dt>Registered</dt><dd>{formatRegistrationDate(registeredAt)}</dd></div>
          </dl>
          <div className="page-actions">
            <Button disabled={status === "APPROVED"} onClick={() => changeStatus("APPROVED")}>Approve</Button>
            <Button variant="danger" disabled={status === "REJECTED"} onClick={() => changeStatus("REJECTED")}>Reject</Button>
          </div>
          {statusMessage ? <p className="mock-data-note" role="status">{statusMessage}</p> : null}
        </article>
      ) : null}
    </main>
  );
}
