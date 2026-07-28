import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;

  try {
    const current = await prisma.penghargaan.findUniqueOrThrow({
      where: { id },
      select: { isPublished: true, nama: true },
    });
    const next = !current.isPublished;

    await prisma.penghargaan.update({ where: { id }, data: { isPublished: next } });

    after(async () => {
      await prisma.logActivity.create({
        data: {
          action: next ? "PUBLISH_PENGHARGAAN" : "UNPUBLISH_PENGHARGAAN",
          target: id,
          details: current.nama,
        },
      });
    });

    return NextResponse.json({ isPublished: next });
  } catch (err) {
    console.error("[api/penghargaan/[id]/publish PATCH]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
