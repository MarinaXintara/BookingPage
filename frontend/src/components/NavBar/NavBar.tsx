import { NavLink } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth.ts";
import UserIconComponent from "../UserIcon/UserIconComponent.tsx";
import "./NavBar.css";

export default function NavBar() {
  const { user } = useAuth();
  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <nav className="topnav" aria-label="Main navigation">
      <div className="nav-links">
        <NavLink className={linkClassName} to="/home">
          Home
        </NavLink>
        <NavLink className={linkClassName} to="/events">
          Events
        </NavLink>
        {user?.role === "USER" || user?.role === "ORGANIZER" ? (
          <NavLink className={linkClassName} to="/messaging">
            Messaging
          </NavLink>
        ) : null}
        <NavLink className={linkClassName} to="/users">
          Users
        </NavLink>
      </div>

      <UserIconComponent />
    </nav>
  );
}
