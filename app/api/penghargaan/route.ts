import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await prisma.penghargaan.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/penghargaan GET]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const body = await req.json() as {
      nama: string; jabatan: string; unitKerja: string; periode: string;
      kategori: string; fotoUrl: string; catatan: string; urutan?: number;
    };
    const { nama, jabatan, unitKerja, periode, kategori, fotoUrl, catatan, urutan } = body;

    if (!nama || !jabatan || !unitKerja || !periode || !kategori || !fotoUrl || !catatan) {
      return NextResponse.json({ error: "Semua kolom wajib diisi." }, { status: 400 });
    }

    const record = await prisma.penghargaan.create({
      data: { nama, jabatan, unitKerja, periode, kategori, fotoUrl, catatan, urutan: urutan ?? 0, createdBy: "Admin" },
    });

    after(async () => {
      await prisma.logActivity.create({
        data: { action: "BUAT_PENGHARGAAN", target: record.id, details: nama },
      });
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[api/penghargaan POST]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
