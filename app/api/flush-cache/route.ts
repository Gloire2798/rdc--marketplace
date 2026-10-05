import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("accueil");
  revalidateTag("boutiques");

  return NextResponse.json({
    succes: true,
    message: "Cache vidé pour accueil + boutiques",
  });
}
