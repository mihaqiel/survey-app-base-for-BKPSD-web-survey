"use server";

import { prisma } from "@/lib/prisma";

// ----------------------------------------------------------------------
// Shared Types
// ----------------------------------------------------------------------
type UnsurFields = {
  u1: number; u2: number; u3: number;
  u4: number; u5: number; u6: number;
  u7: number; u8: number; u9: number;
};

type EmployeeStat = {
  id: string;
  nama: string;
  count: number;
  totalWeightedScore: number;
};

// ----------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW
// ----------------------------------------------------------------------
export async function getAdminDashboardStats() {
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" }
  });

  if (!activePeriod) return null;

  const services = await prisma.layanan.findMany({
    orderBy: { nama: 'asc' },
    include: {
      respon: {
        where: { periodeId: activePeriod.id },
        select: { u1: true, u2: true, u3: true, u4: true, u5: true, u6: true, u7: true, u8: true, u9: true }
      }
    }
  });

  const totalResponses = services.reduce((acc: number, curr: typeof services[0]) => acc + curr.respon.length, 0);

  return {
    periodLabel: activePeriod.label,
    totalResponses,
    services: services.map((s: typeof services[0]) => {
      const total = s.respon.length;
      let ikm = 0;
      if (total > 0) {
        const totalScore = s.respon.reduce((acc: number, r: UnsurFields) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        const nrr = totalScore / (9 * total);
        ikm = parseFloat((nrr * 25).toFixed(1));
      }
      return { id: s.id, nama: s.nama, count: total, ikm };
    })
  };
}

// ----------------------------------------------------------------------
// 2. PORTAL & SERVICE MANAGEMENT (Common Fetcher)
// ----------------------------------------------------------------------
export async function getAllLayanan() {
  return await prisma.layanan.findMany({ orderBy: { nama: 'asc' } });
}

// ----------------------------------------------------------------------
// 3. SERVICE DETAIL: EMPLOYEE ANALYTICS
// ----------------------------------------------------------------------
export async function getServiceEmployeeStats(periodeId: string, layananId: string) {
  const responses = await prisma.respon.findMany({
    where: { periodeId, layananId },
    include: { pegawai: true }
  });

  const statsMap = new Map<string, EmployeeStat>();

  responses.forEach((r: typeof responses[0]) => {
    const empId = r.pegawaiId;
    const current: EmployeeStat = statsMap.get(empId) || {
      id: empId,
      nama: r.pegawai?.nama || "Unknown",
      count: 0,
      totalWeightedScore: 0
    };
    const avgResponseScore = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    current.count += 1;
    current.totalWeightedScore += avgResponseScore * 25;
    statsMap.set(empId, current);
  });

  return Array.from(statsMap.values())
    .map((s: EmployeeStat) => ({
      id: s.id,
      nama: s.nama,
      count: s.count,
      ikm: parseFloat((s.totalWeightedScore / s.count).toFixed(2))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ----------------------------------------------------------------------
// 4. EXCEL EXPORT (Global Data Fetcher)
// ----------------------------------------------------------------------
export async function getGlobalExportData() {
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" }
  });

  if (!activePeriod) return null;

  const services = await prisma.layanan.findMany({
    orderBy: { nama: 'asc' },
    include: {
      respon: {
        where: { periodeId: activePeriod.id },
        include: { pegawai: true }
      }
    }
  });

  const reportData = services.map((service: typeof services[0]) => {
    const responses = service.respon;
    const total = responses.length;

    return {
      serviceName: service.nama,
      totalRespondents: total,
      rawResponses: responses.map((r: typeof responses[0], i: number) => ({
        No: i + 1,
        Tanggal: r.tglLayanan
          ? new Date(r.tglLayanan).toLocaleDateString("id-ID")
          : new Date(r.createdAt).toLocaleDateString("id-ID"),
        Nama: r.nama,
        Umur: r.usia,
        JK: r.jenisKelamin,
        Pendidikan: r.pendidikan,
        Pekerjaan: r.pekerjaan,
        Difabel: r.isDifabel ?? "Tidak",
        JenisDisabilitas: r.jenisDisabilitas ?? "-",
        Pegawai: r.pegawai?.nama || "-",
        U1: r.u1, U2: r.u2, U3: r.u3, U4: r.u4, U5: r.u5,
        U6: r.u6, U7: r.u7, U8: r.u8, U9: r.u9,
        Saran: r.saran || "-",
      }))
    };
  });

  return { periodLabel: activePeriod.label, data: reportData };
}

// ----------------------------------------------------------------------
// 5. SERVICE MANAGEMENT (CRUD Actions)
// ----------------------------------------------------------------------
export async function createLayanan(formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.layanan.create({ data: { nama } });
}

export async function updateLayanan(id: string, formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.layanan.update({ where: { id }, data: { nama } });
}

export async function deleteLayanan(id: string) {
  await prisma.layanan.delete({ where: { id } });
}

// ----------------------------------------------------------------------
// 6. EMPLOYEE MANAGEMENT (CRUD)
// ----------------------------------------------------------------------
export async function getAllPegawai() {
  return await prisma.pegawai.findMany({ orderBy: { nama: 'asc' } });
}

export async function createPegawai(formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.pegawai.create({ data: { nama } });
}

export async function updatePegawai(id: string, formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.pegawai.update({ where: { id }, data: { nama } });
}

export async function deletePegawai(id: string) {
  await prisma.pegawai.delete({ where: { id } });
}

// ----------------------------------------------------------------------
// 7. LOGOUT
// ----------------------------------------------------------------------
export async function logout() {
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  const cookieStore = await cookies();
  cookieStore.delete("skm_token");
  redirect("/enter");
}