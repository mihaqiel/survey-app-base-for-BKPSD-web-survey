import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/pengaduan/[id]/gambar?lid=<lampiranId>
// Serves a single attachment binary for admin view.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const lid = req.nextUrl.searchParams.get("lid");

    if (!lid) {
      return new NextResponse(null, { status: 400 });
    }

    const lampiran = await prisma.pengaduanLampiran.findFirst({
      where: { id: lid, pengaduanId: id },
    });

    if (!lampiran) {
      return new NextResponse(null, { status: 404 });
    }

    const isImage = lampiran.mimeType.startsWith("image/");
    return new NextResponse(lampiran.data, {
      headers: {
        "Content-Type": lampiran.mimeType,
        "Content-Disposition": `${isImage ? "inline" : "attachment"}; filename="${lampiran.nama}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[api/pengaduan/gambar] error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
