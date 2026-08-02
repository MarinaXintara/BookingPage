import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUsers, type User } from "./userApi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    fetchUsers()
      .then((result) => {
        if (!ignore) setUsers(result);
      })
      .catch(() => {
        if (!ignore) setError("Could not load users.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  return (
    <main className="page">
      <header className="page-header"><div><h1>Users</h1><p>{users.length} registered users</p></div></header>
      {isLoading ? <p className="page-message">Loading users...</p> : null}
      {error ? <p className="page-message page-message--error" role="alert">{error}</p> : null}
      {!isLoading && !error && users.length === 0 ? <p className="page-message">No users found.</p> : null}
      {!isLoading && !error && users.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">User</th><th scope="col">Email</th><th scope="col">Role</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <th scope="row"><Link to={`/users/${user.id}`}>{user.firstName} {user.lastName}</Link></th>
                  <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                  <td>{user.role || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
