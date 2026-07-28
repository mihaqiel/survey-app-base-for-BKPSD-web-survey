import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;

  try {
    const body = await req.json() as {
      nama?: string; jabatan?: string; unitKerja?: string; periode?: string;
      kategori?: string; fotoUrl?: string; catatan?: string; urutan?: number;
    };

    const record = await prisma.penghargaan.update({
      where: { id },
      data: {
        ...(body.nama      !== undefined && { nama:      body.nama      }),
        ...(body.jabatan   !== undefined && { jabatan:   body.jabatan   }),
        ...(body.unitKerja !== undefined && { unitKerja: body.unitKerja }),
        ...(body.periode   !== undefined && { periode:   body.periode   }),
        ...(body.kategori  !== undefined && { kategori:  body.kategori  }),
        ...(body.fotoUrl   !== undefined && { fotoUrl:   body.fotoUrl   }),
        ...(body.catatan   !== undefined && { catatan:   body.catatan   }),
        ...(body.urutan    !== undefined && { urutan:    body.urutan    }),
      },
    });

    after(async () => {
      await prisma.logActivity.create({
        data: { action: "UBAH_PENGHARGAAN", target: id, details: record.nama },
      });
    });

    return NextResponse.json(record);
  } catch (err) {
    console.error("[api/penghargaan/[id] PATCH]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;

  try {
    const record = await prisma.penghargaan.delete({ where: { id } });

    after(async () => {
      await prisma.logActivity.create({
        data: { action: "HAPUS_PENGHARGAAN", target: id, details: record.nama },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/penghargaan/[id] DELETE]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
