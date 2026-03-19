import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const logs = await prisma.logActivity.findMany({
      orderBy: { timestamp: "desc" },
      take: 200,
    });
    return NextResponse.json(logs);
  } catch (err) {
    console.error("[/api/logs] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
