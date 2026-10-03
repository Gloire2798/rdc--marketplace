import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerEmail, templateCode } from "@/lib/email";

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

    // Nettoyer les anciens tokens expirés
    await prisma.tokenReset.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { expireAt: { lt: new Date() } },
          { utilise: true },
        ],
      },
    });

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Créer le token (expire dans 15 min)
    await prisma.tokenReset.create({
      data: {
        userId: user.id,
        code,
        expireAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Si l'utilisateur a un email → envoyer par email
    if (user.email) {
      const resultat = await envoyerEmail({
        to: user.email,
        subject: "🔐 GK Sensei — Réinitialisation du mot de passe",
        html: templateCode(
          code,
          "Réinitialisation du mot de passe",
          "Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :"
        ),
      });

      if (resultat.succes) {
        return NextResponse.json({
          succes: true,
          methode: "email",
          message: `Un code a été envoyé à ${masquerEmail(user.email)}`,
        });
      } else {
        // Si l'envoi échoue → afficher à l'écran
        return NextResponse.json({
          succes: true,
          methode: "ecran",
          code,
          message: "Voici votre code de réinitialisation (valable 15 min) :",
        });
      }
    }

    // Pas d'email → afficher le code à l'écran
    return NextResponse.json({
      succes: true,
      methode: "ecran",
      code,
      message: "Voici votre code de réinitialisation (valable 15 min) :",
    });
  } catch (error) {
    console.error("Erreur mot de passe oublié:", error);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}

// Masquer une partie de l'email (ex: gl***@gmail.com)
function masquerEmail(email: string) {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
          }
