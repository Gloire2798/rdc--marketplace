import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH : marquer UNE notification comme lue
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      return NextResponse.json({ erreur: "Notification introuvable" }, { status: 404 });
    }

    if (notif.userId !== session.id) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const miseAJour = await prisma.notification.update({
      where: { id },
      data: { lu: true },
    });

    return NextResponse.json({ succes: true, notification: miseAJour });
  } catch (error) {
    console.error("Erreur PATCH notification:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : supprimer une notification
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      return NextResponse.json({ erreur: "Notification introuvable" }, { status: 404 });
    }

    if (notif.userId !== session.id) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur DELETE notification:", error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
             }
