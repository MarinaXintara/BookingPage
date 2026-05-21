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
  TIN: string;
  role: Role;
  isActive: boolean;
}

export interface WithCurrentUser {
  currentUser: User | null | undefined;
}

export const pagePermissions: Record<string, Role[]> = {
  "/home":          ["admin", "organiser", "user",],
  "/welcome":       ["admin","organiser","user","guest"],
  "/login":         ["admin","organiser","user","guest"],
  "/register":      ["admin","organiser","user","guest"],
  "/admin":         ["admin"],
  "/chat":          ["admin","organiser"],
  "/events":        ["admin","organiser","user","guest"],
  "/events/:eventId":["admin","organiser","user","guest"],
  "/events/create": ["admin", "organiser"],
  "/profile":       ["admin", "organiser", "user"],
};