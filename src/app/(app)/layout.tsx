import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { SideNav } from "@/components/side-nav";
import { roleLabels } from "@/lib/labels";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const name = user.name ?? user.userId;
  const roleLabel = roleLabels[user.role];

  return (
    <div className="min-h-screen lg:flex">
      <SideNav name={name} photoUrl={user.photoUrl} roleLabel={roleLabel} />

      <div className="min-w-0 flex-1">
        <AppHeader name={name} photoUrl={user.photoUrl} roleLabel={roleLabel} />
        <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-10 lg:pb-12 lg:pt-8 xl:max-w-6xl">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
