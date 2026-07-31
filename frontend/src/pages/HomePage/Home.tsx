import { useState } from "react";
import { useAuth } from "../../Auth/useAuth.ts";

export function Home() {
    const { user, logout } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setError(null);

        try {
            await logout();
        } catch {
            setError("Could not log out. Please try again.");
        }
    }

    return (
        <div>
            <h1>Welcome, {user?.firstName}!</h1>
            <p>Signed in as {user?.email} ({user?.role})</p>
            <button
                onClick={handleLogout}
            >
                Logout
            </button>
            
            {error && <p role="alert">{error}</p>}
        </div>
    )
}
