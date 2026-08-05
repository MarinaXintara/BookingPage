import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { CurrentUser } from "../../Auth/Authentication";
import { useAuth } from "../../Auth/useAuth";
import Button from "../../components/Button";
import {
  getMockProfileDetails,
  saveMockProfileDetails,
  type ProfileDetails,
} from "./mockProfileData";

const roleLabels = {
  ADMIN: "Administrator",
  ORGANIZER: "Organizer",
  USER: "Attendee",
} as const;

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <main className="page page--narrow"><p className="page-message">Loading profile...</p></main>;
  if (!user) return <main className="page page--narrow"><p className="page-message page-message--error">Profile unavailable.</p></main>;

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: CurrentUser }) {
  const initialDetails = getMockProfileDetails(user);
  const [details, setDetails] = useState<ProfileDetails>(initialDetails);
  const [formData, setFormData] = useState<ProfileDetails>(initialDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const fullName = `${details.firstName} ${details.lastName}`.trim();

  const primaryAction = user.role === "ADMIN"
    ? { to: "/users", label: "Manage users" }
    : user.role === "ORGANIZER"
      ? { to: "/createEvent", label: "Create event" }
      : { to: "/myBookings", label: "My bookings" };

  return (
    <main className="page page--narrow">
      <header className="page-header">
        <div><h1>{fullName}</h1><p>{roleLabels[user.role]}</p></div>
      </header>
      <section className="panel">
        <h2>Account details</h2>
        {isEditing ? (
          <form className="form" onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="profile-first-name">First name</label>
                <input
                  id="profile-first-name"
                  required
                  value={formData.firstName}
                  onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="profile-last-name">Last name</label>
                <input
                  id="profile-last-name"
                  required
                  value={formData.lastName}
                  onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" value={user.email} disabled />
              <span className="field-hint">Email cannot be changed here.</span>
            </div>
            <div className="form-field">
              <label htmlFor="profile-phone">Phone number</label>
              <input
                id="profile-phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="profile-address">Address</label>
              <input
                id="profile-address"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
              />
            </div>
            <div className="page-actions">
              <Button type="submit">Save details</Button>
              <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <dl className="details-list">
              <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
              <div><dt>Phone</dt><dd>{details.phoneNumber || "Not provided"}</dd></div>
              <div><dt>Address</dt><dd>{details.address || "Not provided"}</dd></div>
            </dl>
            <div className="page-actions">
              <Button onClick={startEditing}>Edit details</Button>
              <Link className="button button--secondary" to={primaryAction.to}>{primaryAction.label}</Link>
              <Link className="button button--secondary" to="/events">Browse events</Link>
            </div>
          </>
        )}
        {saveMessage ? <p className="mock-data-note" role="status">{saveMessage}</p> : null}
      </section>
    </main>
  );

  function startEditing() {
    setFormData(details);
    setSaveMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setFormData(details);
    setIsEditing(false);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updatedDetails = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
    };

    saveMockProfileDetails(user.id, updatedDetails);
    setDetails(updatedDetails);
    setFormData(updatedDetails);
    setIsEditing(false);
    setSaveMessage("Profile updated for this demo. Changes will reset after a full page reload.");
  }
}
