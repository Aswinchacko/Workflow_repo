"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  canApproveProcurement,
  canApproveClaims,
} from "@/lib/session";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

// ---------- Procurement ----------

export async function createProcurement(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const item = str(formData.get("item"));
  const quantity = num(formData.get("quantity"));
  const unit = str(formData.get("unit"));
  const project = str(formData.get("project"));
  if (!item || quantity == null || !unit || !project) {
    throw new Error("Please fill in item, quantity, unit and project.");
  }

  const neededBy = str(formData.get("neededByDate"));

  await prisma.procurementRequest.create({
    data: {
      project,
      item,
      quantity,
      unit,
      neededByDate: neededBy ? new Date(neededBy) : null,
      reason: str(formData.get("reason")) || null,
      estCost: num(formData.get("estCost")),
      requesterId: user.employeeId,
    },
  });

  revalidatePath("/requests/procurement");
  redirect("/requests/procurement");
}

export async function decideProcurement(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canApproveProcurement(user.role)) throw new Error("Not allowed.");

  const id = str(formData.get("id"));
  const decision = str(formData.get("decision")); // APPROVED | REJECTED
  const note = str(formData.get("note"));
  if (!id || (decision !== "APPROVED" && decision !== "REJECTED")) {
    throw new Error("Invalid decision.");
  }

  await prisma.procurementRequest.update({
    where: { id },
    data: {
      status: decision,
      decisionNote: note || null,
      approverId: user.employeeId,
      decidedAt: new Date(),
    },
  });

  revalidatePath("/requests/procurement");
  revalidatePath(`/requests/procurement/${id}`);
}

// ---------- Petty Cash ----------

export async function createPettyCash(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const amount = num(formData.get("amount"));
  const category = str(formData.get("category"));
  const spentDate = str(formData.get("spentDate"));
  if (amount == null || amount <= 0 || !category || !spentDate) {
    throw new Error("Please enter a valid amount, category and date.");
  }

  // attachments arrive as a JSON string of uploaded file URLs
  let attachments = "[]";
  const raw = str(formData.get("attachments"));
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) attachments = JSON.stringify(parsed);
    } catch {
      /* ignore malformed */
    }
  }

  await prisma.pettyCashClaim.create({
    data: {
      amount,
      category,
      spentDate: new Date(spentDate),
      description: str(formData.get("description")) || null,
      attachments,
      requesterId: user.employeeId,
    },
  });

  revalidatePath("/requests/petty-cash");
  redirect("/requests/petty-cash");
}

export async function decideClaim(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canApproveClaims(user.role)) throw new Error("Not allowed.");

  const id = str(formData.get("id"));
  const decision = str(formData.get("decision")); // APPROVED | REJECTED
  const note = str(formData.get("note"));
  if (!id || (decision !== "APPROVED" && decision !== "REJECTED")) {
    throw new Error("Invalid decision.");
  }

  await prisma.pettyCashClaim.update({
    where: { id },
    data: {
      status: decision,
      decisionNote: note || null,
      approverId: user.employeeId,
      decidedAt: new Date(),
    },
  });

  revalidatePath("/requests/petty-cash");
  revalidatePath(`/requests/petty-cash/${id}`);
}

export async function markClaimPaid(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canApproveClaims(user.role)) throw new Error("Not allowed.");

  const id = str(formData.get("id"));
  const paymentRef = str(formData.get("paymentRef"));
  if (!id) throw new Error("Missing claim.");

  await prisma.pettyCashClaim.update({
    where: { id },
    data: { status: "PAID", paymentRef: paymentRef || null, paidAt: new Date() },
  });

  revalidatePath("/requests/petty-cash");
  revalidatePath(`/requests/petty-cash/${id}`);
}
