import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pegawai = await prisma.pegawai.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });
  return NextResponse.json(pegawai);
}