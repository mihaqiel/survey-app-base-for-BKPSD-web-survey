import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Statuses that are safe to show to citizens on the tracking page.
// Internal workflow statuses (BARU, PENDING_VERIFIKASI, PERLU_DATA) are masked.
const PUBLIC_STATUSES = new Set(["DIPROSES", "SELESAI", "DITOLAK"]);

// GET /api/pengaduan/public?ticket=PGD-2026-00003[&email=user@example.com]
// email is optional — if provided, it must match the stored email (case-insensitive).
export async function GET(req: NextRequest) {
  const ticket = req.nextUrl.searchParams.get("ticket")?.toUpperCase().trim();
  const emailParam = req.nextUrl.searchParams.get("email")?.toLowerCase().trim() || null;

  if (!ticket) {
    return NextResponse.json({ error: "Parameter tiket wajib diisi." }, { status: 400 });
  }

  // Validate format: PGD-YYYY-NNNNN
  const match = ticket.match(/^PGD-(\d{4})-(\d+)$/);
  if (!match) {
    return NextResponse.json(
      { error: "Format tiket tidak valid. Contoh yang benar: PGD-2026-00003" },
      { status: 400 }
    );
  }

  const nomorUrut = parseInt(match[2], 10);

  try {
    const pengaduan = await prisma.pengaduan.findFirst({
      where: { nomorUrut },
      select: {
        id: true,
        nomorUrut: true,
        judul: true,
        kategori: true,
        status: true,
        createdAt: true,
        email: true,   // fetched only for verification — never returned to client
        log: {
          where: { visibility: "public" },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            aksi: true,
            deskripsi: true,
            createdAt: true,
          },
        },
      },
    });

    if (!pengaduan) {
      return NextResponse.json(
        { error: "Nomor tiket tidak ditemukan. Pastikan tiket yang Anda masukkan benar." },
        { status: 404 }
      );
    }

    // Optional email verification — if caller provided email, it must match
    if (emailParam && pengaduan.email.toLowerCase() !== emailParam) {
      return NextResponse.json(
        { error: "Email tidak cocok dengan tiket ini. Periksa kembali email yang Anda gunakan saat mendaftar." },
        { status: 403 }
      );
    }

    // Mask internal statuses — citizens don't need to know internal workflow details
    const displayStatus = PUBLIC_STATUSES.has(pengaduan.status)
      ? pengaduan.status
      : "MENUNGGU";

    // Strip PII (email) from the response — only used for verification above
    return NextResponse.json({
      id: pengaduan.id,
      nomorUrut: pengaduan.nomorUrut,
      judul: pengaduan.judul,
      kategori: pengaduan.kategori,
      status: pengaduan.status,       // raw (internal use)
      displayStatus,                  // masked for citizen display
      createdAt: pengaduan.createdAt,
      log: pengaduan.log,
    });
  } catch (err) {
    console.error("[api/pengaduan/public GET] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
