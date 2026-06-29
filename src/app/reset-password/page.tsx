import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage() {
  const user = await requireUser({ allowReset: true });
  if (!user.mustResetPassword) redirect("/");
  return <ResetPasswordForm />;
}
