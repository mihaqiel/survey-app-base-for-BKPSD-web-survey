import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { id } = await params;
    await prisma.periode.updateMany({ where: { status: "AKTIF" }, data: { status: "NONAKTIF" } });
    await prisma.periode.update({ where: { id }, data: { status: "AKTIF" } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/periode/activate] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
