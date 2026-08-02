import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUser, type User } from "../UsersPage/userApi";

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState(userId ? "" : "Missing user id.");

  useEffect(() => {
    if (!userId) return;

    let ignore = false;
    fetchUser(userId)
      .then((result) => {
        if (!ignore) setUser(result);
      })
      .catch(() => {
        if (!ignore) setError("Could not load user.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => { ignore = true; };
  }, [userId]);

  return (
    <main className="page page--narrow">
      <Link to="/users">Back to users</Link>
      {isLoading ? <p className="page-message">Loading user...</p> : null}
      {error ? <p className="page-message page-message--error" role="alert">{error}</p> : null}
      {!isLoading && !error && !user ? <p className="page-message">User not found.</p> : null}
      {user ? (
        <article className="panel">
          <header className="page-header"><div><h1>{user.firstName} {user.lastName}</h1><p>{user.role ?? "User"}</p></div></header>
          <dl className="details-list">
            <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{user.phoneNumber ?? "Not provided"}</dd></div>
            <div><dt>Address</dt><dd>{user.address ?? "Not provided"}</dd></div>
            <div><dt>TIN</dt><dd>{user.tin ?? "Not provided"}</dd></div>
            <div><dt>User ID</dt><dd>{user.id}</dd></div>
          </dl>
        </article>
      ) : null}
    </main>
  );
}
