"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// ── PIN Verification ──────────────────────────────────────────────────────────
export async function verifyDeletePin(pin: string): Promise<{ success: boolean; error?: string }> {
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin) return { success: false, error: "DELETE_PIN belum dikonfigurasi di server." };
  if (pin !== correctPin) return { success: false, error: "PIN salah. Coba lagi." };
  return { success: true };
}

// ── Data Fetchers ─────────────────────────────────────────────────────────────
export async function getLayananWithResponseCount() {
  const list = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: { _count: { select: { respon: true } } },
  });
  return list.map((l: typeof list[0]) => ({ id: l.id, nama: l.nama, count: l._count.respon }));
}

export async function getPegawaiWithResponseCount() {
  const list = await prisma.pegawai.findMany({
    orderBy: { nama: "asc" },
    include: { _count: { select: { respon: true } } },
  });
  return list.map((p: typeof list[0]) => ({ id: p.id, nama: p.nama, count: p._count.respon }));
}

export async function getLayananDetail(id: string) {
  const layanan = await prisma.layanan.findUnique({
    where: { id },
    include: {
      respon: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, nama: true, tglLayanan: true, createdAt: true,
          jenisKelamin: true,
          pegawai: { select: { nama: true } },
          u1: true, u2: true, u3: true, u4: true, u5: true,
          u6: true, u7: true, u8: true, u9: true,
        },
      },
      _count: { select: { respon: true } },
    },
  });
  if (!layanan) return null;
  return {
    id: layanan.id,
    nama: layanan.nama,
    totalCount: layanan._count.respon,
    preview: layanan.respon.map((r: typeof layanan.respon[0]) => ({
      id: r.id, nama: r.nama, tglLayanan: r.tglLayanan,
      createdAt: r.createdAt, jenisKelamin: r.jenisKelamin,
      pegawai: r.pegawai?.nama ?? "-",
      avgScore: parseFloat(
        (((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9) * 25).toFixed(1)
      ),
    })),
  };
}

// ── Action 1: Clear responses for a layanan (keep the layanan record) ─────────
export async function deleteAllResponByLayanan(layananId: string, confirmPhrase: string, pin: string) {
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin || pin !== correctPin) return { error: "PIN tidak valid." };
  if (confirmPhrase !== "HAPUS") return { error: "Frasa konfirmasi salah." };

  const layanan = await prisma.layanan.findUnique({ where: { id: layananId }, select: { nama: true } });
  if (!layanan) return { error: "Layanan tidak ditemukan." };

  const { count } = await prisma.respon.deleteMany({ where: { layananId } });
  await prisma.logActivity.create({
    data: {
      action: "DELETE",
      target: `Respon Layanan: ${layanan.nama}`,
      details: `Hard delete: ${count} respon dihapus secara permanen.`,
    },
  });
  redirect("/admin/hapus-data?tab=respon&success=1");
}

// ── Action 2: Delete layanan record + all its responses ───────────────────────
export async function deleteLayananWithRespon(layananId: string, confirmPhrase: string, pin: string) {
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin || pin !== correctPin) return { error: "PIN tidak valid." };
  if (confirmPhrase !== "HAPUS") return { error: "Frasa konfirmasi salah." };

  const layanan = await prisma.layanan.findUnique({ where: { id: layananId }, select: { nama: true } });
  if (!layanan) return { error: "Layanan tidak ditemukan." };

  const { count: responCount } = await prisma.respon.deleteMany({ where: { layananId } });
  await prisma.layanan.delete({ where: { id: layananId } });

  await prisma.logActivity.create({
    data: {
      action: "DELETE",
      target: `Layanan: ${layanan.nama}`,
      details: `Hard delete: layanan dihapus beserta ${responCount} respon terkait.`,
    },
  });
  redirect("/admin/hapus-data?tab=layanan&success=1");
}

// ── Action 3: Delete pegawai record + all their responses ─────────────────────
export async function deletePegawaiWithRespon(pegawaiId: string, confirmPhrase: string, pin: string) {
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin || pin !== correctPin) return { error: "PIN tidak valid." };
  if (confirmPhrase !== "HAPUS") return { error: "Frasa konfirmasi salah." };

  const pegawai = await prisma.pegawai.findUnique({ where: { id: pegawaiId }, select: { nama: true } });
  if (!pegawai) return { error: "Pegawai tidak ditemukan." };

  const { count: responCount } = await prisma.respon.deleteMany({ where: { pegawaiId } });
  await prisma.pegawai.delete({ where: { id: pegawaiId } });

  await prisma.logActivity.create({
    data: {
      action: "DELETE",
      target: `Pegawai: ${pegawai.nama}`,
      details: `Hard delete: pegawai dihapus beserta ${responCount} respon terkait.`,
    },
  });
  redirect("/admin/hapus-data?tab=pegawai&success=1");
}