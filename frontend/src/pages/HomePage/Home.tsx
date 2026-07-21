export function Home() {

    const logout = async () => {
        await fetch('http://localhost:8080/api/logout', {
            method: 'POST',
            credentials: 'include', // This is important to include cookies
        });
        window.location.href = "/";
    }

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <button
                onClick={logout}
            >
                Logout
            </button>
            <button
                onClick={() => window.location.href = "/test"}
            >test</button>
        </div>
    )
}
