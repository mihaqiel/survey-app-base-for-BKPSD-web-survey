import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";
import { pengaduanStatusUpdateTemplate } from "@/lib/email-templates";
import { STATUS_LIST } from "@/lib/pengaduan";

const EMAIL_STATUSES = new Set(["DIPROSES", "PERLU_DATA", "SELESAI", "DITOLAK"]);

// GET /api/pengaduan — list all complaints (admin only)
export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const pengaduan = await prisma.pengaduan.findMany({
      select: {
        id: true,
        nomorUrut: true,
        nama: true,
        email: true,
        telepon: true,
        judul: true,
        isi: true,
        kategori: true,
        prioritas: true,
        status: true,
        petugasId: true,
        createdAt: true,
        lampiran: {
          select: { id: true, mimeType: true, nama: true, urutan: true },
          orderBy: { urutan: "asc" },
        },
        petugas: { select: { id: true, nama: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pengaduan);
  } catch (err) {
    console.error("[api/pengaduan GET] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH /api/pengaduan — update status / prioritas / petugasId / kategori
export async function PATCH(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const body = await req.json();
    const { id, status, prioritas, petugasId, kategori } = body as {
      id?: string;
      status?: string;
      prioritas?: string;
      petugasId?: string | null;
      kategori?: string | null;
    };

    if (!id) {
      return NextResponse.json({ error: "ID pengaduan wajib diisi." }, { status: 400 });
    }
    if (status !== undefined && !(STATUS_LIST as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    // Fetch current record to compute diff for log entries
    const current = await prisma.pengaduan.findUnique({
      where: { id },
      select: { status: true, prioritas: true, petugasId: true, email: true, nama: true, judul: true, nomorUrut: true, createdAt: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Pengaduan tidak ditemukan." }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status !== undefined)    updateData.status    = status;
    if (prioritas !== undefined) updateData.prioritas = prioritas;
    if (petugasId !== undefined) updateData.petugasId = petugasId;
    if (kategori !== undefined)  updateData.kategori  = kategori;

    const updated = await prisma.pengaduan.update({
      where: { id },
      data: updateData,
      select: { id: true, nomorUrut: true, nama: true, email: true, judul: true, createdAt: true },
    });

    // Build log entries
    const logEntries: { pengaduanId: string; aksi: string; deskripsi: string; oleh: string }[] = [];

    if (status !== undefined && status !== current.status) {
      const prevLabel = current.status;
      const nextLabel = status;
      logEntries.push({
        pengaduanId: id,
        aksi: "STATUS_BERUBAH",
        deskripsi: `${prevLabel} → ${nextLabel}`,
        oleh: "Admin",
      });
    }
    if (prioritas !== undefined && prioritas !== current.prioritas) {
      logEntries.push({
        pengaduanId: id,
        aksi: "PRIORITAS_BERUBAH",
        deskripsi: `${current.prioritas} → ${prioritas}`,
        oleh: "Admin",
      });
    }
    if (petugasId !== undefined && petugasId !== current.petugasId) {
      logEntries.push({
        pengaduanId: id,
        aksi: "PETUGAS_DITUGASKAN",
        deskripsi: petugasId ? `Ditugaskan ke petugas baru` : "Penugasan dihapus",
        oleh: "Admin",
      });
    }

    if (logEntries.length > 0) {
      await prisma.pengaduanLog.createMany({ data: logEntries });
    }

    // Send email for actionable status changes
    if (status !== undefined && EMAIL_STATUSES.has(status) && status !== current.status) {
      const { subject, html } = pengaduanStatusUpdateTemplate({
        nama: updated.nama,
        judul: updated.judul,
        status: status as "DIPROSES" | "PERLU_DATA" | "SELESAI" | "DITOLAK",
        nomorUrut: updated.nomorUrut,
        createdAt: updated.createdAt.toISOString(),
      });
      after(
        sendEmail({ to: updated.email, subject, html }).catch(err =>
          console.error("[api/pengaduan PATCH] status email error:", err)
        )
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/pengaduan PATCH] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
