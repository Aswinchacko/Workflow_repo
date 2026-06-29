import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rpName, getRpId } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.user.id;

  const existing = await prisma.authenticator.findMany({
    where: { userId },
    select: { credentialID: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID: getRpId(),
    userID: new TextEncoder().encode(userId),
    userName: session.user.userId,
    userDisplayName: session.user.name ?? session.user.userId,
    attestationType: "none",
    excludeCredentials: existing.map((a) => ({
      id: a.credentialID,
      transports: a.transports ? JSON.parse(a.transports) : undefined,
    })),
    authenticatorSelection: {
      residentKey: "discouraged",
      userVerification: "required", // forces fingerprint / Face / device PIN
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: options.challenge },
  });

  return NextResponse.json({ options });
}
