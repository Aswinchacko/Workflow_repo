import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/enums";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Use in protected pages: redirects to /login if not signed in, and to
 *  /reset-password if the user still needs to set their password. */
export async function requireUser(opts: { allowReset?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustResetPassword && !opts.allowReset) redirect("/reset-password");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export const isManagerLike = (role: Role) =>
  role === "MANAGER" || role === "ADMIN_HR";

export const canApproveProcurement = (role: Role) =>
  role === "MANAGER" || role === "ADMIN_HR";

export const canApproveClaims = (role: Role) =>
  role === "FINANCE" || role === "ADMIN_HR";

/** Full profile details are visible to managers/HR; everyone else sees basics. */
export const canSeeFullProfile = (role: Role) => isManagerLike(role);
