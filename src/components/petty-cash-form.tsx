"use client";

import { useState, useRef } from "react";
import { createPettyCash } from "@/app/(app)/requests/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, FileText } from "lucide-react";

type Attachment = { url: string; name: string; isPdf: boolean };

const CATEGORIES = [
  "Transport",
  "Tools & Supplies",
  "Site Refreshments",
  "Fuel",
  "Office Supplies",
  "Other",
];

// Resize/compress an image file to keep uploads small on mobile data.
async function compressImage(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const maxDim = 1600;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? source), "image/jpeg", 0.8)
  );
}

async function prepareFile(file: File): Promise<File> {
  // Convert iPhone HEIC/HEIF to JPEG first.
  const isHeic =
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  let working: Blob = file;
  if (isHeic) {
    const heic2any = (await import("heic2any")).default as (opts: {
      blob: Blob;
      toType: string;
      quality: number;
    }) => Promise<Blob | Blob[]>;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
    working = Array.isArray(out) ? out[0] : out;
  }
  const compressed = await compressImage(working);
  return new File([compressed], "receipt.jpg", { type: "image/jpeg" });
}

export function PettyCashForm() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      for (const f of files) {
        const isPdf = f.type === "application/pdf";
        const toSend = isPdf ? f : await prepareFile(f);
        const fd = new FormData();
        fd.append("file", toSend);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setAttachments((prev) => [
          ...prev,
          { url: data.url, name: f.name, isPdf },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form action={createPettyCash} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount (AED) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="spentDate">Date spent *</Label>
              <Input
                id="spentDate"
                name="spentDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="description">What was it for?</Label>
            <Textarea id="description" name="description" placeholder="Short description" />
          </div>

          {/* Receipts */}
          <div>
            <Label>Receipts / proof</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              multiple
              onChange={onFiles}
              className="hidden"
              id="receipt-input"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" /> Add Photo / File
                </>
              )}
            </Button>

            {attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {attachments.map((a) => (
                  <div
                    key={a.url}
                    className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
                  >
                    {a.isPdf ? (
                      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-7 w-7" />
                        <span className="mt-1 text-[10px]">PDF</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.url)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <input
            type="hidden"
            name="attachments"
            value={JSON.stringify(attachments.map((a) => a.url))}
          />

          <Button type="submit" size="lg" className="w-full" disabled={uploading}>
            Submit Claim
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
