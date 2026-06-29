import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRpId } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.user.id;

  const creds = await prisma.authenticator.findMany({ where: { userId } });
  if (creds.length === 0) {
    // No passkey yet -> the client should run registration instead.
    return NextResponse.json({ hasCredentials: false });
  }

  const options = await generateAuthenticationOptions({
    rpID: getRpId(),
    allowCredentials: creds.map((c) => ({
      id: c.credentialID,
      transports: c.transports ? JSON.parse(c.transports) : undefined,
    })),
    userVerification: "required",
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: options.challenge },
  });

  return NextResponse.json({ hasCredentials: true, options });
}
