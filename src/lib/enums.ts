// App-level enums. Stored as strings in SQLite (demo); become native Postgres
// enums in production. Keep these in sync with prisma/schema.prisma comments.

export type Role = "ADMIN_HR" | "MANAGER" | "FINANCE" | "EMPLOYEE";
export type EmploymentType = "OFFICE" | "SITE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export const Roles: Role[] = ["ADMIN_HR", "MANAGER", "FINANCE", "EMPLOYEE"];
