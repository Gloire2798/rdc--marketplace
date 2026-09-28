import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/vendeur/connexion");
}
