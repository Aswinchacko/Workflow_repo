import type { Role, EmploymentType } from "@/lib/enums";

export const roleLabels: Record<Role, string> = {
  ADMIN_HR: "Admin / HR",
  MANAGER: "Manager",
  FINANCE: "Finance",
  EMPLOYEE: "Employee",
};

export const employmentLabels: Record<EmploymentType, string> = {
  OFFICE: "Office Staff",
  SITE: "Site Worker",
};
