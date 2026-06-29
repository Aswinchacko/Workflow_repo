import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/enums";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Use in protected pages: redirects to /login if not signed in, and to
 *  /reset-password if the user still needs to set their password.
 *  Re-loads the user from the DB so stale JWTs (e.g. after db:seed) don't break pages. */
export async function requireUser(opts: { allowReset?: boolean } = {}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { employee: { select: { name: true, photoUrl: true } } },
  });
  if (!dbUser) redirect("/login");

  const user = {
    id: sessionUser.id,
    name: dbUser.employee.name,
    userId: dbUser.userId,
    role: dbUser.role as Role,
    employeeId: dbUser.employeeId,
    mustResetPassword: dbUser.mustResetPassword,
    photoUrl: dbUser.employee.photoUrl ?? null,
  };

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

/** Managers and HR can mark check-in/out for their team. */
export const canMarkTeamAttendance = (role: Role) => isManagerLike(role);
