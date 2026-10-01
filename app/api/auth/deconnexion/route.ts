import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ succes: true });
  } catch {
    return NextResponse.json({ succes: false }, { status: 500 });
  }
}
