import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";
import { pengaduanStatusUpdateTemplate } from "@/lib/email-templates";

// GET /api/pengaduan — list all complaints (admin only, no binary data)
export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const pengaduan = await prisma.pengaduan.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        telepon: true,
        judul: true,
        isi: true,
        status: true,
        createdAt: true,
        lampiran: {
          select: { id: true, mimeType: true, nama: true, urutan: true },
          orderBy: { urutan: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pengaduan);
  } catch (err) {
    console.error("[api/pengaduan GET] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH /api/pengaduan — update status
export async function PATCH(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id, status } = await req.json();
    if (!id || !["BARU", "DIPROSES", "SELESAI"].includes(status)) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }
    const updated = await prisma.pengaduan.update({
      where: { id },
      data: { status },
      select: { nama: true, email: true, judul: true },
    });

    // Fire-and-forget: notify complainant on meaningful status changes only
    if (status === "DIPROSES" || status === "SELESAI") {
      const { subject, html } = pengaduanStatusUpdateTemplate({
        nama: updated.nama,
        judul: updated.judul,
        status,
      });
      sendEmail({ to: updated.email, subject, html }).catch(err =>
        console.error("[api/pengaduan PATCH] status email error:", err)
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/pengaduan PATCH] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
