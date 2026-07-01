// auth/authentication.ts

export type Role = "admin" | "organiser" | "user" | "guest";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  tin: string;
  role: Role;
  isActive: boolean;
}

export interface WithCurrentUser {
  currentUser: User | null | undefined;
}

