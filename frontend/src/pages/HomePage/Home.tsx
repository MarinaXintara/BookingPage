export function Home() {


    const logout=()=>{
        localStorage.removeItem("isLoggedIn")
        window.location.href = "/login";
    }

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <button
                onClick={logout}
                >
                Logout
                </button>
        </div>
    )
}
