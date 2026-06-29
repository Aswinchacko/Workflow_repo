import { renderToBuffer } from "@react-pdf/renderer";
import { ProcurementPdfDocument, type ProcurementPdfData } from "@/lib/procurement-pdf-document";
import { company } from "@/lib/company";
import { fmtDate, fmtDateTime } from "@/lib/datetime";
import { roleLabels } from "@/lib/labels";
import type { RequestStatus, Role } from "@/lib/enums";
import { procurementPdfFilename, procurementRef } from "@/lib/procurement-ref";

type RequestRecord = {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  project: string;
  neededByDate: Date | null;
  reason: string | null;
  estCost: number | null;
  status: string;
  decisionNote: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  requester: {
    name: string;
    department: { name: string } | null;
    user: { userId: string } | null;
  };
  approver: { name: string } | null;
};

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "PENDING REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export function buildProcurementPdfData(
  r: RequestRecord,
  printedBy: { name: string; role: Role }
): ProcurementPdfData {
  const status = r.status as RequestStatus;
  const ref = procurementRef(r.id, r.createdAt);
  const subtotal = r.estCost ?? null;
  const unitCost =
    subtotal != null && r.quantity > 0 ? subtotal / r.quantity : null;
  const vatAmount = subtotal != null ? subtotal * company.vatRate : null;
  const totalWithVat =
    subtotal != null && vatAmount != null ? subtotal + vatAmount : null;

  return {
    ref,
    item: r.item,
    quantity: r.quantity,
    unit: r.unit,
    project: r.project,
    neededByDate: r.neededByDate?.toISOString() ?? null,
    reason: r.reason,
    estCost: r.estCost,
    unitCost,
    subtotal,
    vatAmount,
    totalWithVat,
    status,
    statusLabel: statusLabels[status] ?? status,
    requesterName: r.requester.name,
    requesterUserId: r.requester.user?.userId ?? "—",
    departmentName: r.requester.department?.name ?? null,
    submittedAt: fmtDateTime(r.createdAt),
    neededByFormatted: r.neededByDate ? fmtDate(r.neededByDate) : null,
    approverName: r.approver?.name ?? null,
    decidedAt: r.decidedAt ? fmtDateTime(r.decidedAt) : null,
    decisionNote: r.decisionNote,
    generatedAt: fmtDateTime(new Date()),
    printedByName: printedBy.name,
    printedByRole: roleLabels[printedBy.role],
  };
}

export async function renderProcurementPdf(
  r: RequestRecord,
  printedBy: { name: string; role: Role }
): Promise<{ buffer: Buffer; filename: string }> {
  const data = buildProcurementPdfData(r, printedBy);
  const buffer = await renderToBuffer(<ProcurementPdfDocument data={data} />);
  const filename = procurementPdfFilename(data.ref, r.item, new Date());
  return { buffer: Buffer.from(buffer), filename };
}
