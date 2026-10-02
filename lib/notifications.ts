import { prisma } from "./prisma";

// ============================================================
// CRÉER UNE NOTIFICATION POUR UN UTILISATEUR
// ============================================================

export async function creerNotification(
  userId: string,
  type: string,
  titre: string,
  message: string,
  lien?: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        titre,
        message,
        lien: lien || null,
      },
    });
  } catch (error) {
    console.error("Erreur création notification:", error);
    return null;
  }
}

// ============================================================
// CRÉER UNE NOTIFICATION POUR TOUS LES ADMINS
// ============================================================

export async function creerNotificationAdmin(
  type: string,
  titre: string,
  message: string,
  lien?: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length === 0) return [];

    return await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type,
        titre,
        message,
        lien: lien || null,
      })),
    });
  } catch (error) {
    console.error("Erreur notification admin:", error);
    return null;
  }
}

// ============================================================
// CRÉER UNE NOTIFICATION POUR TOUS LES ABONNÉS D'UNE BOUTIQUE
// ============================================================

export async function creerNotificationAbonnes(
  vendeurId: string,
  type: string,
  titre: string,
  message: string,
  lien?: string
) {
  try {
    const abonnes = await prisma.abonnement.findMany({
      where: { vendeurId },
      select: { userId: true },
    });

    if (abonnes.length === 0) return [];

    return await prisma.notification.createMany({
      data: abonnes.map((a) => ({
        userId: a.userId,
        type,
        titre,
        message,
        lien: lien || null,
      })),
    });
  } catch (error) {
    console.error("Erreur notification abonnés:", error);
    return null;
  }
}

// ============================================================
// CRÉER UNE NOTIFICATION POUR LE PROPRIÉTAIRE D'UNE BOUTIQUE
// ============================================================

export async function creerNotificationVendeur(
  vendeurId: string,
  type: string,
  titre: string,
  message: string,
  lien?: string
) {
  try {
    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
      select: { userId: true },
    });

    if (!vendeur) return null;

    return await creerNotification(
      vendeur.userId,
      type,
      titre,
      message,
      lien
    );
  } catch (error) {
    console.error("Erreur notification vendeur:", error);
    return null;
  }
}

// ============================================================
// COMPTER LES NOTIFICATIONS NON LUES
// ============================================================

export async function compterNonLues(userId: string) {
  try {
    return await prisma.notification.count({
      where: { userId, lu: false },
    });
  } catch (error) {
    console.error("Erreur comptage non lues:", error);
    return 0;
  }
        }
