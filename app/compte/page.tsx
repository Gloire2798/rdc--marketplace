import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PageCompte() {
  const session = await getSession();

  if (session) {
    if (session.role === "ADMIN") redirect("/admin/dashboard");
    if (session.role === "VENDEUR") redirect("/vendeur/dashboard");
    if (session.role === "ACHETEUR") redirect("/client/compte");
  }

  redirect("/vendeur/connexion");
}
