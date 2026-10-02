import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET : récupérer les notifications de l'utilisateur connecté
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const nonLues = notifications.filter((n) => !n.lu).length;

    return NextResponse.json({
      succes: true,
      notifications,
      nonLues,
    });
  } catch (error) {
    console.error("Erreur GET notifications:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH : marquer toutes les notifications comme lues
export async function PATCH() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.id, lu: false },
      data: { lu: true },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur PATCH notifications:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
  }
