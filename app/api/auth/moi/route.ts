import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ succes: false });
    }

    return NextResponse.json({
      succes: true,
      user: {
        id: session.id,
        nom: session.nom,
        role: session.role,
      },
    });
  } catch {
    return NextResponse.json({ succes: false });
  }
}
