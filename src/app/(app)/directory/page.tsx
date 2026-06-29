import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

export default async function DirectoryPage() {
  await requireUser();

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      employees: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, jobTitle: true, photoUrl: true, phone: true },
      },
    },
  });

  const nonEmpty = departments.filter((d) => d.employees.length > 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Team Directory</h1>
        <p className="text-muted-foreground">Find your colleagues by department.</p>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
      {nonEmpty.map((dept) => (
        <section key={dept.id}>
          <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {dept.name} · {dept.employees.length}
          </h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {dept.employees.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/directory/${emp.id}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-secondary"
                >
                  <Avatar name={emp.name} src={emp.photoUrl} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{emp.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{emp.jobTitle}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      ))}
      </div>
    </div>
  );
}
