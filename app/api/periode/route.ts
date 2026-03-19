import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { label, token } = await req.json();
    if (!label || !token) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const periode = await prisma.periode.create({ data: { label, token, status: "NONAKTIF" } });
    return NextResponse.json(periode);
  } catch (err: unknown) {
    // Unique constraint violation = token already exists
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Token already exists" }, { status: 400 });
    }
    console.error("[/api/periode] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
