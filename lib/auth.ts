import { cookies } from "next/headers";
import { prisma } from "./prisma";

export type UserRole = "ACHETEUR" | "VENDEUR" | "ADMIN";

export interface SessionUser {
  id: string;
  telephone: string;
  nom: string | null;
  role: UserRole;
}

/**
 * Crée une session en enregistrant un cookie sécurisé
 */
export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: "/",
  });
}

/**
 * Récupère l'utilisateur connecté depuis le cookie de session
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telephone: true,
        nom: true,
        role: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      telephone: user.telephone,
      nom: user.nom,
      role: user.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Supprime la session (déconnexion)
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_id");
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 */
export async function requireRole(role: UserRole): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== role) return null;
  return session;
}
