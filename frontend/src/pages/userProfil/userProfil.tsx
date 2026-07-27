import { fetchUser, type User } from "../UsersPage/userApi"
import { useEffect, useState } from "react";

export default function Profil({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                const data = await fetchUser(userId)
                setUser(data);
            }
            catch (err) {
                console.log("Cannot fetch user details:", err)
                setError("Could not load user details.")
            }
        };
        loadUserDetails();
    }, [userId])
    if (error) {
        return <p>{error}</p>;
    }
    return (
        <div className="container mt-3">
            <h2>Basic Card</h2>

            <div className="card">
                <div className="card-body">
                    <li>{user?.firstName}</li>
                    <button onClick={() => (window.location.href = "/myBookings")}>
                        My bookings
                    </button>
                </div>
            </div>
        </div>
    );
}
