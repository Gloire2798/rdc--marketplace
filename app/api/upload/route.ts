import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { erreur: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const fichier = formData.get("fichier") as File | null;

    if (!fichier) {
      return NextResponse.json(
        { erreur: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5 MB)
    if (fichier.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { erreur: "La photo ne doit pas dépasser 5 MB" },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (!fichier.type.startsWith("image/")) {
      return NextResponse.json(
        { erreur: "Seules les images sont acceptées" },
        { status: 400 }
      );
    }

    // Convertir en base64 pour Cloudinary
    const bytes = await fichier.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${fichier.type};base64,${buffer.toString("base64")}`;

    // Upload vers Cloudinary
    const resultat = await cloudinary.uploader.upload(base64, {
      folder: "gk-sensei/produits",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
      ],
    });

    return NextResponse.json({
      succes: true,
      url: resultat.secure_url,
      publicId: resultat.public_id,
    });
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json(
      { erreur: "Erreur lors de l'upload de la photo" },
      { status: 500 }
    );
  }
}
