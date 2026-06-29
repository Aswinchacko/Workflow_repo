import Link from "next/link";
import { requireUser } from "@/lib/session";
import { createProcurement } from "@/app/(app)/requests/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tomorrowYmd } from "@/lib/datetime";
import { ChevronLeft } from "lucide-react";

export default async function NewProcurementPage() {
  await requireUser();
  const minNeededBy = tomorrowYmd();

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-2xl">
      <Link
        href="/requests/procurement"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" /> Material Requests
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">New Material Request</h1>

      <Card>
        <CardContent className="pt-5">
          <form action={createProcurement} className="space-y-4">
            <div>
              <Label htmlFor="item">What do you need? *</Label>
              <Input id="item" name="item" placeholder="e.g. Cement bags" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Input id="unit" name="unit" placeholder="bags, m, pcs" required />
              </div>
            </div>

            <div>
              <Label htmlFor="project">Project / Site *</Label>
              <Input
                id="project"
                name="project"
                list="projects"
                placeholder="e.g. Marina Tower Project"
                required
              />
              <datalist id="projects">
                <option value="Marina Tower Project" />
                <option value="Business Bay Project" />
              </datalist>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="neededByDate">Needed by *</Label>
                <Input
                  id="neededByDate"
                  name="neededByDate"
                  type="date"
                  min={minNeededBy}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estCost">Estimated cost (AED)</Label>
                <Input
                  id="estCost"
                  name="estCost"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason / notes</Label>
              <Textarea id="reason" name="reason" placeholder="Why is this needed?" />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
