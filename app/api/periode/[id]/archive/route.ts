// app/api/periode/[id]/archive/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

/**
 * POST /api/periode/[id]/archive
 *
 * Transitions a periode from LOCKED → ARCHIVED.
 * Archived periodes are hidden from main dashboard selectors
 * but all data is preserved in the database.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { id } = await params;

    const periode = await prisma.periode.findUnique({ where: { id }, select: { id: true, label: true, status: true } });
    if (!periode) return NextResponse.json({ error: "Periode tidak ditemukan." }, { status: 404 });

    if (periode.status !== "LOCKED") {
      return NextResponse.json({ error: "Hanya periode yang dikunci (LOCKED) yang bisa diarsipkan." }, { status: 400 });
    }

    await prisma.periode.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await prisma.logActivity.create({
      data: {
        action:  "ARCHIVE",
        target:  `Periode: ${periode.label}`,
        details: "Periode diarsipkan (ARCHIVED). Data tetap tersimpan di database.",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/periode/archive] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
