export type Role = "ADMIN" | "ORGANIZER" | "USER";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface WithCurrentUser {
  currentUser: CurrentUser | null | undefined;
}
