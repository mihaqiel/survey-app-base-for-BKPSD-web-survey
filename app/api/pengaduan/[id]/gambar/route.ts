import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const p = await prisma.pengaduan.findUnique({
      where: { id },
      select: { gambar: true, gambarType: true, gambarName: true },
    });

    if (!p?.gambar) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(p.gambar, {
      headers: {
        "Content-Type": p.gambarType ?? "image/jpeg",
        "Content-Disposition": `inline; filename="${p.gambarName ?? "gambar"}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[api/pengaduan/gambar] error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
