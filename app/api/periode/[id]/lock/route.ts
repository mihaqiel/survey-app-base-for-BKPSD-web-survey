// app/api/periode/[id]/lock/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

/**
 * POST /api/periode/[id]/lock
 *
 * Transitions a periode from NONAKTIF → LOCKED.
 * A locked periode accepts no new submissions but is fully readable.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { id } = await params;

    const periode = await prisma.periode.findUnique({ where: { id }, select: { id: true, label: true, status: true } });
    if (!periode) return NextResponse.json({ error: "Periode tidak ditemukan." }, { status: 404 });

    if (periode.status === "AKTIF") {
      return NextResponse.json({ error: "Nonaktifkan periode terlebih dahulu sebelum menguncinya." }, { status: 400 });
    }
    if (periode.status === "LOCKED") {
      return NextResponse.json({ error: "Periode sudah dikunci." }, { status: 400 });
    }
    if (periode.status === "ARCHIVED") {
      return NextResponse.json({ error: "Periode yang diarsipkan tidak bisa dikunci ulang." }, { status: 400 });
    }

    await prisma.periode.update({
      where: { id },
      data: { status: "LOCKED", lockedAt: new Date() },
    });

    await prisma.logActivity.create({
      data: {
        action:  "UPDATE",
        target:  `Periode: ${periode.label}`,
        details: "Periode dikunci (LOCKED). Tidak ada pengisian baru yang diterima.",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/periode/lock] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
