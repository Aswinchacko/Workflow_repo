import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rpFromRequest, internalTransport } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { rpID } = rpFromRequest(req);
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.user.id;

  const creds = await prisma.authenticator.findMany({ where: { userId } });
  // Only platform (built-in) credentials — ignore any old USB/Bluetooth enrollments.
  const platformCreds = creds.filter(
    (c) => c.deviceLabel !== "multiDevice"
  );

  if (platformCreds.length === 0) {
    // No passkey yet (or only external keys) -> enroll platform auth on device.
    return NextResponse.json({ hasCredentials: false });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: platformCreds.map((c) => ({
      id: c.credentialID,
      transports: [...internalTransport],
    })),
    userVerification: "required",
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: options.challenge },
  });

  return NextResponse.json({ hasCredentials: true, options });
}
