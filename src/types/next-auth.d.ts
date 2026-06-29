import type { Role } from "@/lib/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: Role;
    userId: string;
    employeeId: string;
    mustResetPassword: boolean;
    photoUrl?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      role: Role;
      userId: string;
      employeeId: string;
      mustResetPassword: boolean;
      photoUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    userId: string;
    employeeId: string;
    mustResetPassword: boolean;
    photoUrl?: string | null;
  }
}
