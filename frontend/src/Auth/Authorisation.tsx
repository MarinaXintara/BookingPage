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
  "/home":            ["ADMIN", "ORGANIZER", "USER"],
  "/welcome":         ["ADMIN", "ORGANIZER", "USER"],
  "/login":           ["ADMIN", "ORGANIZER", "USER"],
  "/register":        ["ADMIN", "ORGANIZER", "USER"],
  "/admin":           ["ADMIN"],
  "/messaging":       ["ADMIN", "ORGANIZER", "USER"],
  "/events":          ["ADMIN", "ORGANIZER", "USER"],
  "/events/:eventId": ["ADMIN", "ORGANIZER", "USER"],
  "/events/createEvent":   ["ADMIN", "ORGANIZER"],
  "/profile":         ["ADMIN", "ORGANIZER", "USER"],
};
