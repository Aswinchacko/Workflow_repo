"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

function SubmitButton({
  decision,
  children,
  variant,
}: {
  decision: "APPROVED" | "REJECTED";
  children: React.ReactNode;
  variant: "success" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="decision"
      value={decision}
      variant={variant}
      size="lg"
      className="flex-1"
      disabled={pending}
    >
      {children}
    </Button>
  );
}

export function DecisionForm({
  id,
  action,
  notePlaceholder = "Add a note (optional)",
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  notePlaceholder?: string;
}) {
  const [note, setNote] = useState("");

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <Label htmlFor="note">Decision note</Label>
        <Textarea
          id="note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={notePlaceholder}
        />
      </div>
      <div className="flex gap-3">
        <SubmitButton decision="REJECTED" variant="destructive">
          <X className="h-5 w-5" /> Reject
        </SubmitButton>
        <SubmitButton decision="APPROVED" variant="success">
          <Check className="h-5 w-5" /> Approve
        </SubmitButton>
      </div>
    </form>
  );
}
