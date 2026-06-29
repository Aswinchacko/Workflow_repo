import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { company } from "@/lib/company";
import type { RequestStatus } from "@/lib/enums";

export type ProcurementPdfData = {
  ref: string;
  item: string;
  quantity: number;
  unit: string;
  project: string;
  neededByDate: string | null;
  reason: string | null;
  estCost: number | null;
  unitCost: number | null;
  subtotal: number | null;
  vatAmount: number | null;
  totalWithVat: number | null;
  status: RequestStatus;
  statusLabel: string;
  requesterName: string;
  requesterUserId: string;
  departmentName: string | null;
  submittedAt: string;
  neededByFormatted: string | null;
  approverName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  generatedAt: string;
  printedByName: string;
  printedByRole: string;
};

const navy = "#1e4d8c";
const slate = "#334155";
const muted = "#64748b";
const border = "#cbd5e1";
const light = "#f8fafc";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: slate,
    paddingTop: 28,
    paddingBottom: 52,
    paddingHorizontal: 36,
  },
  headerBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: navy,
    paddingBottom: 10,
    marginBottom: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  companyName: { fontSize: 13, fontWeight: "bold", color: navy },
  companyLine: { fontSize: 8, color: muted, marginTop: 2 },
  refBlock: { textAlign: "right" },
  refLabel: { fontSize: 7, color: muted, textTransform: "uppercase" },
  refValue: { fontSize: 10, fontWeight: "bold", color: slate },
  titleBar: {
    backgroundColor: light,
    borderWidth: 1,
    borderColor: border,
    padding: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: navy,
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  statusPending: { backgroundColor: "#fef3c7", color: "#92400e" },
  statusApproved: { backgroundColor: "#dcfce7", color: "#166534" },
  statusRejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
  twoCol: { flexDirection: "row", gap: 16, marginBottom: 12 },
  col: { flex: 1 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: navy,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaLabel: { width: "42%", fontSize: 8, color: muted },
  metaValue: { width: "58%", fontSize: 8, fontWeight: "bold", color: slate },
  table: {
    borderWidth: 1,
    borderColor: border,
    marginBottom: 12,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: navy,
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: border,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 8,
  },
  colNum: { width: "6%", textAlign: "center" },
  colDesc: { width: "34%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnit: { width: "10%", textAlign: "center" },
  colUnitCost: { width: "18%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right", fontWeight: "bold" },
  totalsBlock: {
    borderTopWidth: 1,
    borderTopColor: border,
    padding: 8,
    alignItems: "flex-end",
  },
  totalRow: { flexDirection: "row", marginBottom: 3, width: "55%" },
  totalLabel: { flex: 1, textAlign: "right", fontSize: 8, color: muted, paddingRight: 8 },
  totalValue: { width: 90, textAlign: "right", fontSize: 8, fontWeight: "bold" },
  grandTotal: { fontSize: 10, color: navy },
  notesBox: {
    borderWidth: 1,
    borderColor: border,
    padding: 8,
    marginBottom: 12,
    minHeight: 40,
  },
  notesText: { fontSize: 8, lineHeight: 1.4 },
  approvalBox: {
    borderWidth: 1,
    borderColor: border,
    marginBottom: 12,
  },
  approvalHead: {
    backgroundColor: light,
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: border,
    fontSize: 8,
    fontWeight: "bold",
    color: navy,
  },
  approvalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: border,
    fontSize: 8,
  },
  checkCol: { width: 16, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: border,
    paddingTop: 6,
  },
  footerLine: { fontSize: 7, color: muted, textAlign: "center", marginBottom: 2 },
  disclaimer: { fontSize: 7, color: muted, lineHeight: 1.35, marginBottom: 10 },
});

function money(n: number | null): string {
  if (n == null) return "—";
  return `AED ${n.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusStyle(status: RequestStatus) {
  if (status === "APPROVED") return s.statusApproved;
  if (status === "REJECTED") return s.statusRejected;
  return s.statusPending;
}

function ApprovalRow({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail: string;
}) {
  return (
    <View style={s.approvalRow}>
      <Text style={s.checkCol}>{done ? "[x]" : "[ ]"}</Text>
      <Text style={{ width: "28%", fontWeight: "bold" }}>{label}</Text>
      <Text style={{ flex: 1 }}>{detail}</Text>
    </View>
  );
}

export function ProcurementPdfDocument({ data }: { data: ProcurementPdfData }) {
  const approvalDetail =
    data.status === "APPROVED"
      ? `${data.approverName ?? "—"}${data.decidedAt ? ` · ${data.decidedAt}` : ""}`
      : data.status === "REJECTED"
        ? `Rejected${data.approverName ? ` by ${data.approverName}` : ""}${data.decidedAt ? ` · ${data.decidedAt}` : ""}`
        : "Awaiting approval";

  return (
    <Document title={`Material Request ${data.ref}`} author={company.name}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerBand}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>AR</Text>
            </View>
            <View>
              <Text style={s.companyName}>{company.name}</Text>
              <Text style={s.companyLine}>{company.addressLine1}</Text>
              <Text style={s.companyLine}>{company.addressLine2}</Text>
              <Text style={s.companyLine}>TRN: {company.trn}</Text>
            </View>
          </View>
          <View style={s.refBlock}>
            <Text style={s.refLabel}>Reference</Text>
            <Text style={s.refValue}>{data.ref}</Text>
            <Text style={[s.refLabel, { marginTop: 6 }]}>Issue date</Text>
            <Text style={s.refValue}>{data.generatedAt.split(",")[0]}</Text>
            <Text style={[s.refLabel, { marginTop: 4 }]}>Page</Text>
            <Text style={s.refValue}>1 of 1</Text>
          </View>
        </View>

        {/* Title bar */}
        <View style={s.titleBar}>
          <Text style={s.docTitle}>MATERIAL REQUEST ESTIMATE</Text>
          <Text style={[s.statusBadge, statusStyle(data.status)]}>{data.statusLabel}</Text>
        </View>

        {/* Meta columns */}
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Prepared for</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Project / Site</Text>
              <Text style={s.metaValue}>{data.project}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Department</Text>
              <Text style={s.metaValue}>{data.departmentName ?? "—"}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Requested by</Text>
              <Text style={s.metaValue}>{data.requesterName}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Employee ID</Text>
              <Text style={s.metaValue}>{data.requesterUserId}</Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Request details</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Request ID</Text>
              <Text style={s.metaValue}>{data.ref}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Submitted</Text>
              <Text style={s.metaValue}>{data.submittedAt}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Needed by</Text>
              <Text style={s.metaValue}>{data.neededByFormatted ?? "—"}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Currency</Text>
              <Text style={s.metaValue}>AED</Text>
            </View>
          </View>
        </View>

        {/* Line items */}
        <Text style={s.sectionTitle}>Line items</Text>
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={s.colNum}>#</Text>
            <Text style={s.colDesc}>Description</Text>
            <Text style={s.colQty}>Qty</Text>
            <Text style={s.colUnit}>Unit</Text>
            <Text style={s.colUnitCost}>Unit cost</Text>
            <Text style={s.colAmount}>Amount</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={s.colNum}>1</Text>
            <Text style={s.colDesc}>{data.item}</Text>
            <Text style={s.colQty}>{data.quantity}</Text>
            <Text style={s.colUnit}>{data.unit}</Text>
            <Text style={s.colUnitCost}>{money(data.unitCost)}</Text>
            <Text style={s.colAmount}>{money(data.subtotal)}</Text>
          </View>
          <View style={s.totalsBlock}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal (estimated)</Text>
              <Text style={s.totalValue}>{money(data.subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>VAT ({company.vatRate * 100}% — if applicable)</Text>
              <Text style={s.totalValue}>{money(data.vatAmount)}</Text>
            </View>
            <View style={[s.totalRow, { marginTop: 4 }]}>
              <Text style={[s.totalLabel, s.grandTotal]}>Total estimate</Text>
              <Text style={[s.totalValue, s.grandTotal]}>{money(data.totalWithVat)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <Text style={s.sectionTitle}>Justification / notes</Text>
        <View style={s.notesBox}>
          <Text style={s.notesText}>{data.reason?.trim() || "—"}</Text>
        </View>

        {/* Approval trail */}
        <View style={s.approvalBox}>
          <Text style={s.approvalHead}>Approval status</Text>
          <ApprovalRow
            done
            label="Submitted"
            detail={`${data.requesterName} · ${data.submittedAt}`}
          />
          <ApprovalRow
            done={data.status !== "PENDING"}
            label="Manager review"
            detail={
              data.status === "PENDING"
                ? "Awaiting approval"
                : approvalDetail
            }
          />
          <ApprovalRow
            done={data.status === "APPROVED"}
            label="Final status"
            detail={
              data.status === "APPROVED"
                ? "Approved for procurement"
                : data.status === "REJECTED"
                  ? `Rejected${data.decisionNote ? ` — ${data.decisionNote}` : ""}`
                  : "—"
            }
          />
          {data.decisionNote && data.status !== "REJECTED" && (
            <View style={{ padding: 8, borderTopWidth: 1, borderTopColor: border }}>
              <Text style={{ fontSize: 7, color: muted }}>Decision note</Text>
              <Text style={{ fontSize: 8, marginTop: 2 }}>{data.decisionNote}</Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        {company.disclaimer.map((line, i) => (
          <Text key={i} style={s.disclaimer}>
            * {line}
          </Text>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLine}>
            {company.name} · {company.phone} · {company.email}
          </Text>
          <Text style={s.footerLine}>
            Generated: {data.generatedAt} · Exported by: {data.printedByName} ({data.printedByRole}) ·{" "}
            {company.portalName}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
