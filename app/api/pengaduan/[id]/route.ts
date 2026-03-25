import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/pengaduan/[id] — single complaint with log (admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;

  try {
    const pengaduan = await prisma.pengaduan.findUnique({
      where: { id },
      include: {
        lampiran: {
          select: { id: true, mimeType: true, nama: true, urutan: true },
          orderBy: { urutan: "asc" },
        },
        log: { orderBy: { createdAt: "asc" } },
        petugas: { select: { id: true, nama: true } },
      },
    });
    if (!pengaduan) {
      return NextResponse.json({ error: "Pengaduan tidak ditemukan." }, { status: 404 });
    }
    // Strip binary data from response
    const { lampiran, ...rest } = pengaduan;
    return NextResponse.json({
      ...rest,
      lampiran: lampiran.map(({ id, mimeType, nama, urutan }) => ({ id, mimeType, nama, urutan })),
    });
  } catch (err) {
    console.error("[api/pengaduan/[id] GET] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
