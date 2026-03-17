import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.periode.update({ where: { id }, data: { status: "NONAKTIF" } });
  return NextResponse.json({ ok: true });
}