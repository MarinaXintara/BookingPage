import { Link } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth";
import "./Profile.css";

interface ProfileAction {
  title: string;
  description: string;
  to: string;
  emphasis?: boolean;
}

const roleLabels = {
  ADMIN: "Administrator",
  ORGANIZER: "Organizer",
  USER: "Attendee",
} as const;

export default function Profile() {
  const { user, loading } = useAuth();

  /*
   * BACKEND TODO:
   * Add a session-scoped /api/profile endpoint with a safe response DTO before
   * adding contact details or editing here. Do not use /api/users/{id}: it
   * currently returns the User entity (including its password hash) and is not
   * restricted to the account stored in the authenticated session.
   */

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-state" aria-live="polite">
          <div className="profile-spinner" aria-hidden="true" />
          <h1>Loading your profile</h1>
          <p>We&apos;re getting your account details ready.</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-state" role="alert">
          <h1>Profile unavailable</h1>
          <p>Your account details could not be loaded.</p>
          <Link className="profile-button" to="/login">
            Return to login
          </Link>
        </section>
      </main>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const roleLabel = roleLabels[user.role];
  const actions: ProfileAction[] = [
    {
      title: "My bookings",
      description: "Review your upcoming events and booking history.",
      to: "/myBookings",
      emphasis: true,
    },
    {
      title: "Explore events",
      description: "Find new events and reserve your next tickets.",
      to: "/events",
    },
  ];

  if (user.role !== "ADMIN") {
    actions.push({
      title: "Messages",
      description: "Open your conversations with other members.",
      to: "/messaging",
    });
  }

  if (user.role === "ORGANIZER" || user.role === "ADMIN") {
    actions.push({
      title: "Create an event",
      description: "Publish a new event and configure its details.",
      to: "/create-event",
    });
  }

  if (user.role === "ADMIN") {
    actions.push({
      title: "Manage users",
      description: "View registered members and account information.",
      to: "/users",
    });
  }

  return (
    <main className="profile-page">
      <header className="profile-hero">
        <div>
          <h1>{fullName}</h1>
          <p className="profile-hero__summary">
            View your account details and quickly return to the parts of the
            platform you use most.
          </p>
        </div>
        <span className={`profile-role profile-role--${user.role.toLowerCase()}`}>
          {roleLabel}
        </span>
      </header>

      <div className="profile-layout">
        <section
          className="profile-panel profile-details"
          aria-labelledby="profile-details-heading"
        >
          <div className="profile-panel__header">
            <div>
              <p className="profile-section-label">Personal information</p>
              <h2 id="profile-details-heading">Account details</h2>
            </div>
            <span className="profile-read-only">Read only</span>
          </div>

          <dl className="profile-detail-list">
            <div>
              <dt>Full name</dt>
              <dd>{fullName}</dd>
            </div>
            <div>
              <dt>Email address</dt>
              <dd>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd>{roleLabel}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd>#{user.id}</dd>
            </div>
          </dl>

          <aside className="profile-backend-note">
            <strong>Profile editing is not available yet.</strong>
            <span>
              Additional contact details and secure editing will appear here
              when account-management support is added.
            </span>
          </aside>
        </section>

        <nav
          className="profile-panel profile-actions"
          aria-labelledby="profile-actions-heading"
        >
          <div className="profile-panel__header">
            <div>
              <p className="profile-section-label">Shortcuts</p>
              <h2 id="profile-actions-heading">Account activity</h2>
            </div>
          </div>

          <div className="profile-action-list">
            {actions.map((action) => (
              <Link
                className={`profile-action${action.emphasis ? " profile-action--primary" : ""}`}
                key={action.to}
                to={action.to}
              >
                <span>
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>
                <span className="profile-action__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
