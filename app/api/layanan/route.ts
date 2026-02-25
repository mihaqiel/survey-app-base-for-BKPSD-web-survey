import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const layanan = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });
  return NextResponse.json(layanan);
}