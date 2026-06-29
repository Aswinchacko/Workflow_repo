import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderProcurementPdf } from "@/lib/procurement-pdf";
import type { Role } from "@/lib/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r = await prisma.procurementRequest.findUnique({
    where: { id: params.id },
    include: {
      requester: {
        select: {
          name: true,
          department: { select: { name: true } },
          user: { select: { userId: true } },
        },
      },
      approver: { select: { name: true } },
    },
  });

  if (!r) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { buffer, filename } = await renderProcurementPdf(r, {
    name: session.user.name ?? "User",
    role: session.user.role as Role,
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
