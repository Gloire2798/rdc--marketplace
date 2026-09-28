import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function VendeurPage() {
  const session = await getSession();

  if (session?.role === "VENDEUR") {
    redirect("/vendeur/dashboard");
  }

  redirect("/vendeur/connexion");
}
