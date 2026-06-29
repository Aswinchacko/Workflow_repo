import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rpFromRequest } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { rpID, origin } = rpFromRequest(req);
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.currentChallenge) {
    return NextResponse.json({ error: "No active challenge" }, { status: 400 });
  }

  const body = await req.json();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: message, verified: false }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const { credential, credentialDeviceType } = verification.registrationInfo;

  if (credentialDeviceType === "multiDevice") {
    return NextResponse.json(
      {
        error: "Please use your device PIN or fingerprint, not a USB or Bluetooth security key.",
        verified: false,
      },
      { status: 400 }
    );
  }

  // Keep one passkey per device (phone + laptop can both work). Remove USB keys only.
  await prisma.authenticator.deleteMany({
    where: { userId, deviceLabel: "multiDevice" },
  });

  await prisma.authenticator.upsert({
    where: { credentialID: credential.id },
    create: {
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: JSON.stringify(["internal"]),
      deviceLabel: credentialDeviceType,
      userId,
    },
    update: {
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: JSON.stringify(["internal"]),
      deviceLabel: credentialDeviceType,
      lastUsedAt: new Date(),
    },
  });

  // Cap at 5 devices per user (drop oldest).
  const all = await prisma.authenticator.findMany({
    where: { userId },
    orderBy: { lastUsedAt: "asc" },
  });
  if (all.length > 5) {
    await prisma.authenticator.deleteMany({
      where: { id: { in: all.slice(0, all.length - 5).map((a) => a.id) } },
    });
  }

  await prisma.user.update({ where: { id: userId }, data: { currentChallenge: null } });

  return NextResponse.json({ verified: true });
}
