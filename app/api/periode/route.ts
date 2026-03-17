import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { label, token } = await req.json();
  if (!label || !token) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  try {
    const periode = await prisma.periode.create({ data: { label, token, status: "NONAKTIF" } });
    return NextResponse.json(periode);
  } catch {
    return NextResponse.json({ error: "Token already exists" }, { status: 400 });
  }
}