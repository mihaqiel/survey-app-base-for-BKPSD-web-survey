import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getApiLimiter } from "@/lib/ratelimit";

// GET /api/pengaduan — list all complaints (admin only)
export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const pengaduan = await prisma.pengaduan.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        telepon: true,
        judul: true,
        isi: true,
        gambarName: true,
        gambarType: true,
        status: true,
        createdAt: true,
        // exclude gambar bytes from list view
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pengaduan);
  } catch (err) {
    console.error("[api/pengaduan GET] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH /api/pengaduan — update status
export async function PATCH(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id, status } = await req.json();
    if (!id || !["BARU", "DIPROSES", "SELESAI"].includes(status)) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }
    await prisma.pengaduan.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/pengaduan PATCH] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
