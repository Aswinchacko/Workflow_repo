/** Human-readable reference e.g. MR-2026-A1B2C3 */
export function procurementRef(id: string, createdAt: Date): string {
  const year = createdAt.getFullYear();
  const suffix = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `MR-${year}-${suffix}`;
}

export function procurementPdfFilename(ref: string, item: string, date: Date): string {
  const slug = item
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const day = date.toISOString().slice(0, 10);
  return `Material-Request_${ref}_${slug || "Request"}_${day}.pdf`;
}
