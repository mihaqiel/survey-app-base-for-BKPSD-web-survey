import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiLimiter } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const { success } = await getApiLimiter().limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const pegawai = await prisma.pegawai.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    });
    return NextResponse.json(pegawai);
  } catch (err) {
    console.error("[/api/pegawai] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
