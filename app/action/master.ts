"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/utils";

// 1. 🛡️ GET DASHBOARD DATA
export async function getDashboardData() {
  // Only fetch "AKTIF" services effectively, or show all with status badge
  const agency = await prisma.perangkatDaerah.findFirst({
    include: {
      layanan: {
        where: { status: "AKTIF" }, // Hide soft-deleted services
        include: {
          periode: {
            where: { status: { not: "ARCHIVED" } }, // Hide archived periods
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });

  // Auto-create agency if empty (First run setup)
  if (!agency) {
    return await prisma.perangkatDaerah.create({
      data: {
        nama: "BADAN KEPEGAWAIAN & PENGEMBANGAN SDM",
        alamat: "Pemerintah Daerah"
      },
      include: { layanan: { include: { periode: true } } }
    });
  }

  return agency;
}

// 2. 📂 CREATE LAYANAN
export async function createLayanan(formData: FormData) {
  const nama = formData.get("nama") as string;
  const perangkatId = formData.get("perangkatId") as string;

  await prisma.layanan.create({
    data: { nama, perangkatId, status: "AKTIF" }
  });

  // Audit Log
  await prisma.logActivity.create({
    data: { action: "CREATE_LAYANAN", target: nama }
  });

  revalidatePath("/admin");
}

// 3. 🗓️ CREATE PERIODE (With Auto-Token)
export async function createPeriode(formData: FormData) {
  const label = formData.get("label") as string;
  const layananId = formData.get("layananId") as string;
  const tglMulai = new Date(formData.get("tglMulai") as string);
  const tglSelesai = new Date(formData.get("tglSelesai") as string);

  // Fetch service name for token generation
  const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
  if (!layanan) return;

  // Generate Token: LK-202502-X9K2
  const token = generateToken(layanan.nama);

  await prisma.periode.create({
    data: {
      label,
      tglMulai,
      tglSelesai,
      layananId,
      token, // 👈 Auto-generated
      status: "AKTIF"
    }
  });

  // Audit Log
  await prisma.logActivity.create({
    data: { 
      action: "CREATE_PERIODE", 
      target: `${label} (${token})`,
      details: `Start: ${tglMulai}, End: ${tglSelesai}`
    }
  });

  revalidatePath("/admin");
}

// 4. 🗑️ DELETE / ARCHIVE PERIODE (Smart Delete)
export async function deletePeriode(id: string) {
  // Check if responses exist
  const count = await prisma.respon.count({ where: { periodeId: id } });

  if (count > 0) {
    // 🛑 STOP! Data exists. Soft Delete (Archive) instead.
    await prisma.periode.update({
      where: { id },
      data: { status: "ARCHIVED" }
    });
    
    await prisma.logActivity.create({
      data: { action: "ARCHIVE_PERIODE", target: id, details: `Contains ${count} responses` }
    });

  } else {
    // ✅ Safe to Hard Delete (No data)
    await prisma.periode.delete({ where: { id } });
    
    await prisma.logActivity.create({
      data: { action: "DELETE_PERIODE", target: id, details: "Hard delete (empty)" }
    });
  }

  revalidatePath("/admin");
}