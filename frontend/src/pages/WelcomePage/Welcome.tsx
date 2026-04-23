import React, { useEffect, useState } from "react";
import "./Welcome.css";

const Welcome: React.FC = () => {

    const [response, setResponse] = useState("loading...");

    useEffect(() => {
        fetch("http://localhost:8080/api/test")
            .then((res) => res.text())
            .then((data) => setResponse(data))
            .catch((_err) => setResponse("Error fetching data"));
    }, []);

    return (
        <div className="welcome-page">
            <h1>Welcome to BookIT</h1>
            <p>You can search here your favourite event.</p>

            <div className="welcome-actions">
                <button onClick={() => window.location.href = "/events"}>Search Events</button>
            </div>
            {response}
        </div>
    );
};

export default Welcome;