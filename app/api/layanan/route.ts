import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getApiLimiter } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await getApiLimiter().limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const layanan = await prisma.layanan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    });
    return NextResponse.json(layanan);
  } catch (err) {
    console.error("[/api/layanan] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
