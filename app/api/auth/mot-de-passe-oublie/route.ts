import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telephone } = body;

    if (!telephone) {
      return NextResponse.json(
        { erreur: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telephone },
    });

    if (!user) {
      return NextResponse.json(
        { erreur: "Aucun compte trouvé avec ce numéro" },
        { status: 404 }
      );
    }

    // TODO : Envoyer un vrai SMS/WhatsApp avec un lien de réinitialisation
    // Pour l'instant, message manuel

    return NextResponse.json({
      succes: true,
      message:
        "Votre demande a été enregistrée. Contactez l'administrateur sur WhatsApp au 0822630873 pour réinitialiser votre mot de passe.",
    });
  } catch (error) {
    console.error("Erreur mot de passe oublié:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
