import React from "react";
import { Link } from "react-router-dom";
import "./UsersPage.css";
import { fetchUsers, type User } from "./userApi";

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        const result = await fetchUsers();

        if (!ignore) {
          setUsers(result);
          setError(null);
        }
      } catch {
        if (!ignore) {
          setError("Could not load users.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="users-page">
      <section className="users-header">
        <div>
          <p className="users-eyebrow">Admin</p>
          <h1>Users</h1>
        </div>
        <div className="users-count" aria-label={`${users.length} users`}>
          {users.length}
        </div>
      </section>

      {isLoading ? (
        <section className="users-state" aria-live="polite">
          Loading users...
        </section>
      ) : error ? (
        <section className="users-state users-state-error" role="alert">
          {error}
        </section>
      ) : users.length === 0 ? (
        <section className="users-state">No users found.</section>
      ) : (
        <section className="users-table-wrap" aria-label="User table">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <th scope="row">
                    <Link to={`/users`}>
                      {user.firstName} {user.lastName}
                    </Link>
                  </th>
                  <td>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td>{user.role || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
