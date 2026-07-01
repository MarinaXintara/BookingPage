import React from "react";
import { Link, useParams } from "react-router-dom";
import "../UsersPage/UsersPage.css";
import "./UserDetailsPage.css";
import { fetchUser, type User } from "../UsersPage/userApi";

function getInitials(user: User) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) {
      setError("Missing user id.");
      setIsLoading(false);
      return;
    }

    const requestedUserId = userId;
    let ignore = false;

    async function loadUser() {
      try {
        const result = await fetchUser(requestedUserId);

        if (!ignore) {
          setUser(result);
          setError(null);
        }
      } catch {
        if (!ignore) {
          setError("Could not load user.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [userId]);

  return (
    <main className="users-page user-details-page">
      <div className="user-details-shell">
        <Link className="user-back-link" to="/users">
          Back to users
        </Link>

        {isLoading ? (
          <section className="users-state" aria-live="polite">
            Loading user...
          </section>
        ) : error ? (
          <section className="users-state users-state-error" role="alert">
            {error}
          </section>
        ) : !user ? (
          <section className="users-state">User not found.</section>
        ) : (
          <article className="user-profile">
            <section className="user-profile-header">
              <div className="user-profile-avatar" aria-hidden="true">
                {getInitials(user)}
              </div>
              <div>
                <p className="users-eyebrow">{user.role ?? "User"}</p>
                <h1>
                  {user.firstName} {user.lastName}
                </h1>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            </section>

            <dl className="user-profile-details">
              <div>
                <dt>Phone</dt>
                <dd>{user.phoneNumber ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{user.address ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>TIN</dt>
                <dd>{user.tin ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>User ID</dt>
                <dd>{user.id}</dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </main>
  );
}
