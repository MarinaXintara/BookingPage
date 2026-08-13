import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { fetchUser, type User } from "../UsersPage/userApi";
import{getRoleLabel} from "../UsersPage/userPresentation";
// import {
//   type AccountStatus,
//   formatRegistrationDate,
//   getRoleLabel,
//   getStatusLabel,
//   getUserMetadata,
//   updateDemoUserStatus,
// } from "../UsersPage/userPresentation";

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState(userId ? "" : "Missing user id.");
  const [status, setStatus] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    fetchUser(userId)
      .then((result) => {
        if (!ignore) {
          
          setUser(result);
         
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

  async function handleApprove() {
  if (!userId) return;

  try {
    setStatusMessage("");

    const response = await fetch(
      `http://localhost:8080/api/auth/approveStatus/${userId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Could not approve user.");
    }

    setUser((current) =>
      current
        ? { ...current, status: "APPROVED" }
        : current
    );

    setStatusMessage("User approved successfully.");
  } catch (error) {
    setStatusMessage(
      error instanceof Error
        ? error.message
        : "Could not approve user."
    );
  }
}

async function handleReject() {
  if (!userId) return;

  try {
    setStatusMessage("");

    const response = await fetch(
      `http://localhost:8080/api/auth/rejectStatus/${userId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Could not reject user.");
    }

    setUser((current) =>
      current
        ? { ...current, status: "REJECTED" }
        : current
    );

    setStatusMessage("User rejected successfully.");
  } catch (error) {
    setStatusMessage(
      error instanceof Error
        ? error.message
        : "Could not reject user."
    );
  }
}

async function handleAdmin() {
  if (!userId) return;

  try {
    setStatusMessage("");

    const response = await fetch(
      `http://localhost:8080/api/auth/changeRole/${userId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Could not reject user.");
    }

    setUser((current) =>
      current
        ? { ...current, role: "ADMIN" }
        : current
    );

    setStatusMessage("User  change successfully.");
  } catch (error) {
    setStatusMessage(
      error instanceof Error
        ? error.message
        : "Could not change user role."
    );
  }
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
              <p>{(user.role)}</p>
            </div>
          </header>
          <dl className="details-list">
            <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{user.phoneNumber ?? "Not provided"}</dd></div>
            {/* <div><dt>Status</dt><dd>{status ? <span className={`status-badge status-badge--${status.toLowerCase()}`}>{getStatusLabel(user.status)}</span> : "Not available"}</dd></div> */}
           <div><dt>Status</dt><dd>{user.status}</dd></div>
          </dl>
          <div className="page-actions">
            <Button disabled={user.status === "APPROVED" || user.status==="REJECTED"} onClick={handleApprove}>Approve</Button>
            <Button variant="danger" disabled={user.status === "APPROVED" || user.status === "REJECTED"} onClick={handleReject}>Reject</Button>
            <Button disabled={user.role==="ADMIN"} onClick={handleAdmin}>Set as admin</Button>
            {/* <Button disabled={user.role==="ORGANISER"} onClick={}>Set as organiser</Button> */}
          </div>
         
          {statusMessage ? <p className="mock-data-note" role="status">{user.status}</p> : null}
        </article>
      ) : null}
    </main>
  );
}
