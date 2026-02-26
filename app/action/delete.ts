"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// ── PIN Verification ──────────────────────────────────────────────────────────
export async function verifyDeletePin(pin: string): Promise<{ success: boolean; error?: string }> {
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin) {
    return { success: false, error: "DELETE_PIN belum dikonfigurasi di server." };
  }
  if (pin !== correctPin) {
    return { success: false, error: "PIN salah. Coba lagi." };
  }
  return { success: true };
}

export async function getLayananWithResponseCount() {
  const layananList = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: {
      _count: { select: { respon: true } },
    },
  });

  return layananList.map((l) => ({
    id: l.id,
    nama: l.nama,
    count: l._count.respon,
  }));
}

export async function getLayananDetail(id: string) {
  const layanan = await prisma.layanan.findUnique({
    where: { id },
    include: {
      respon: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          nama: true,
          tglLayanan: true,
          createdAt: true,
          jenisKelamin: true,
          pegawai: { select: { nama: true } },
          u1: true, u2: true, u3: true,
          u4: true, u5: true, u6: true,
          u7: true, u8: true, u9: true,
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
    preview: layanan.respon.map((r) => ({
      id: r.id,
      nama: r.nama,
      tglLayanan: r.tglLayanan,
      createdAt: r.createdAt,
      jenisKelamin: r.jenisKelamin,
      pegawai: r.pegawai?.nama ?? "-",
      avgScore: parseFloat(
        (((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9) * 25).toFixed(1)
      ),
    })),
  };
}

export async function deleteAllResponByLayanan(
  layananId: string,
  confirmPhrase: string,
  pin: string
) {
  // Re-verify PIN server-side (never trust client state alone)
  const correctPin = process.env.DELETE_PIN;
  if (!correctPin || pin !== correctPin) {
    return { error: "PIN tidak valid." };
  }

  if (confirmPhrase !== "HAPUS") {
    return { error: "Frasa konfirmasi salah." };
  }

  const layanan = await prisma.layanan.findUnique({
    where: { id: layananId },
    select: { nama: true },
  });

  if (!layanan) {
    return { error: "Layanan tidak ditemukan." };
  }

  const { count } = await prisma.respon.deleteMany({
    where: { layananId },
  });

  await prisma.logActivity.create({
    data: {
      action: "DELETE",
      target: `Layanan: ${layanan.nama}`,
      details: `Hard delete: ${count} respon dihapus secara permanen.`,
    },
  });

  redirect("/admin/hapus-data?success=1");
}