import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PettyCashForm } from "@/components/petty-cash-form";
import { ChevronLeft } from "lucide-react";

export default async function NewPettyCashPage() {
  await requireUser();

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-2xl">
      <Link
        href="/requests/petty-cash"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> Petty Cash
      </Link>

      <h1 className="text-2xl font-extrabold">New Petty Cash Claim</h1>
      <PettyCashForm />
    </div>
  );
}
