import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrigin, getRpId } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

  const cred = await prisma.authenticator.findUnique({
    where: { credentialID: body.id },
  });
  if (!cred || cred.userId !== userId) {
    return NextResponse.json({ error: "Unknown credential", verified: false }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpId(),
      requireUserVerification: true,
      credential: {
        id: cred.credentialID,
        publicKey: new Uint8Array(cred.publicKey),
        counter: cred.counter,
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: message, verified: false }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  await prisma.authenticator.update({
    where: { id: cred.id },
    data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });
  await prisma.user.update({ where: { id: userId }, data: { currentChallenge: null } });

  return NextResponse.json({ verified: true });
}
