import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.periode.updateMany({ where: { status: "AKTIF" }, data: { status: "NONAKTIF" } });
  await prisma.periode.update({ where: { id }, data: { status: "AKTIF" } });
  return NextResponse.json({ ok: true });
}