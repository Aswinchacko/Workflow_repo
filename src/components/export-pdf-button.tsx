import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportPdfButton({ href, label = "Export PDF" }: { href: string; label?: string }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Button type="button" variant="outline" size="sm">
        <Download className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
