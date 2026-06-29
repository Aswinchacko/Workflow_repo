import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/enums";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId.trim() },
          include: { employee: true },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.employee.name,
          userId: user.userId,
          role: user.role as Role,
          employeeId: user.employeeId,
          mustResetPassword: user.mustResetPassword,
          photoUrl: user.employee.photoUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.userId = user.userId;
        token.employeeId = user.employeeId;
        token.mustResetPassword = user.mustResetPassword;
        token.photoUrl = user.photoUrl;
      }
      // Allow client to refresh mustResetPassword flag after a reset.
      if (trigger === "update" && session?.mustResetPassword === false) {
        token.mustResetPassword = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.userId = token.userId as string;
        session.user.employeeId = token.employeeId as string;
        session.user.mustResetPassword = token.mustResetPassword as boolean;
        session.user.photoUrl = (token.photoUrl as string | null) ?? null;
      }
      return session;
    },
  },
};
