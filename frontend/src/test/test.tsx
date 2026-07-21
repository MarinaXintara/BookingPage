import { useEffect, useState } from "react";

type User = {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/auth/me", {
      method: "GET",
      credentials: "include" // σημαντικό για HttpSession
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Not logged in");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setUser(data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      {user && (
        <>
          <h2>User Info</h2>
          <p>ID: {user.id}</p>
          <p>Name: {user.firstName}</p>
          <p>Surname: {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      )}
    </div>
  );
}