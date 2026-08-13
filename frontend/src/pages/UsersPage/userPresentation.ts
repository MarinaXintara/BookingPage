export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

interface UserMetadata {
  status: AccountStatus;
  registeredAt: string | null;
}

// Temporary frontend data. Replace this with fields from the users API when the
// backend supports account status and registration dates.
const mockMetadata: Record<number, UserMetadata> = {
  1: { status: "APPROVED", registeredAt: "2026-01-10" },
  2: { status: "APPROVED", registeredAt: "2026-02-03" },
  3: { status: "APPROVED", registeredAt: "2026-03-18" },
  4: { status: "PENDING", registeredAt: "2026-04-07" },
};

const demoStatusChanges = new Map<number, AccountStatus>();

export function getUserMetadata(userId: number): UserMetadata {
  const metadata = mockMetadata[userId] ?? {
    status: "PENDING",
    registeredAt: null,
  };

  return {
    ...metadata,
    status: demoStatusChanges.get(userId) ?? metadata.status,
  };
}

export function updateDemoUserStatus(userId: number, status: AccountStatus) {
  demoStatusChanges.set(userId, status);
}

export function getRoleLabel(role?: string | null) {
  if (role === "ADMIN") return "Administrator";
  if (role === "ORGANIZER") return "Organizer";
  return "User";
}

export function getStatusLabel(status: AccountStatus) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return "Pending";
}

export function formatRegistrationDate(date: string | null) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
