import { useLocation } from "react-router-dom";
import "./NavBar.css";


export default function NavBar() {

    const location = useLocation().pathname;

    const isActive = (pathName: string) => {
        if (location.startsWith(pathName)) {
            return "active";
        }
        else {
            return ""
        }
    }

    return (
        <div className="topnav">
            <a className={isActive("/home")} href="/home">Home</a>
            <a className={isActive("/events")} href="/events">Events</a>
            <a className={isActive("/chat")} href="/chat">Chat</a>
            <a className={isActive("/users")} href="/users">Users</a>
        </div>
    )

};