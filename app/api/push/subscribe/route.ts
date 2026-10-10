import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { erreur: "Données d'abonnement invalides" },
        { status: 400 }
      );
    }

    // Upsert : si l'endpoint existe déjà → mettre à jour le userId
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
      create: {
        userId: session.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur subscribe push:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { erreur: "Endpoint manquant" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.id,
      },
    });

    return NextResponse.json({ succes: true });
  } catch (error) {
    console.error("Erreur unsubscribe push:", error);
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
       }
