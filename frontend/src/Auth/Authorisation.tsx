// auth/authorisation.ts

import type { Role, WithCurrentUser } from "./Authentication.tsx";

function requireRole(allowedRoles: Role[]) {
  return function <This extends WithCurrentUser, Args extends unknown[]>(
    target: (this: This, ...args: Args) => Promise<unknown>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<unknown>>
  ) {
    // context.name confirms the method name — no unused vars
    const methodName = String(context.name);

    return async function (this: This, ...args: Args): Promise<unknown> {
      const user = this.currentUser;

      if (!user) {
        throw new Error(`[${methodName}] Access denied. No authenticated user found.`);
      }

      if (!user.isActive) {
        throw new Error(`[${methodName}] Access denied. Account "${user.email}" is inactive.`);
      }

      if (!allowedRoles.includes(user.role)) {
        throw new Error(
          `[${methodName}] Access denied. Role "${user.role}" not in: ${allowedRoles.join(", ")}.`
        );
      }

      return await target.apply(this, args);
    };
  };
}
export { requireRole };

export const pagePermissions: Record<string, Role[]> = {
  "/home":            ["admin", "organiser", "user"],
  "/welcome":         ["admin","organiser","user"],
  "/login":           ["admin","organiser","user"],
  "/register":        ["admin","organiser","user"],
  "/admin":           ["admin"],
  "/chat":            ["admin","organiser"],
  "/events":          ["admin","organiser","user"],
  "/events/:eventId": ["admin","organiser","user"],
  "/events/create-event":   ["admin", "organiser"],
  "/profile":         ["admin", "organiser", "user"],
};
