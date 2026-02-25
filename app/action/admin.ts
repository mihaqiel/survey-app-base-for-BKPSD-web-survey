"use server";

import { prisma } from "@/lib/prisma";

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

  const totalResponses = services.reduce((acc, curr) => acc + curr.respon.length, 0);

  return {
    periodLabel: activePeriod.label,
    totalResponses,
    services: services.map(s => {
      const total = s.respon.length;
      let ikm = 0;
      if (total > 0) {
        const totalScore = s.respon.reduce((acc, r) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        const nrr = totalScore / (9 * total);
        ikm = parseFloat((nrr * 25).toFixed(1));
      }
      return {
        id: s.id,
        nama: s.nama,
        count: total,
        ikm,
      };
    })
  };
}

// ----------------------------------------------------------------------
// 2. PORTAL & SERVICE MANAGEMENT (Common Fetcher)
// ----------------------------------------------------------------------
export async function getAllLayanan() {
  return await prisma.layanan.findMany({
    orderBy: { nama: 'asc' },
  });
}

// ----------------------------------------------------------------------
// 3. SERVICE DETAIL: EMPLOYEE ANALYTICS
// ----------------------------------------------------------------------
export async function getServiceEmployeeStats(periodeId: string, layananId: string) {
  const responses = await prisma.respon.findMany({
    where: { periodeId, layananId },
    include: { pegawai: true }
  });

  const statsMap = new Map();

  responses.forEach(r => {
    const empId = r.pegawaiId;
    const current = statsMap.get(empId) || {
      id: empId,
      nama: r.pegawai?.nama || "Unknown",
      count: 0,
      totalWeightedScore: 0
    };
    const avgResponseScore = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    const ikmValue = avgResponseScore * 25;
    current.count += 1;
    current.totalWeightedScore += ikmValue;
    statsMap.set(empId, current);
  });

  return Array.from(statsMap.values())
    .map((s: any) => ({
      id: s.id,
      nama: s.nama,
      count: s.count,
      ikm: parseFloat((s.totalWeightedScore / s.count).toFixed(2))
    }))
    .sort((a: any, b: any) => b.count - a.count)
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

  const reportData = services.map(service => {
    const responses = service.respon;
    const total = responses.length;
    let totalScore = 0;
    const sums = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    responses.forEach(r => {
      totalScore += (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9);
      sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
      sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
      sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
    });

    const nrr = total > 0 ? totalScore / (9 * total) : 0;
    const ikm = nrr * 25;

    const demographics = {
      gender: { L: 0, P: 0 },
      education: {} as Record<string, number>,
      job: {} as Record<string, number>
    };

    responses.forEach(r => {
      if (r.jenisKelamin === "Laki-laki") demographics.gender.L++;
      else demographics.gender.P++;
      demographics.education[r.pendidikan] = (demographics.education[r.pendidikan] || 0) + 1;
      demographics.job[r.pekerjaan] = (demographics.job[r.pekerjaan] || 0) + 1;
    });

    return {
      serviceName: service.nama,
      totalRespondents: total,
      ikm: ikm.toFixed(2),
      averagePerUnsur: sums.map(s => total > 0 ? (s / total).toFixed(2) : "0"),
      demographics,
      rawResponses: responses.map((r, i) => ({
        No: i + 1,
        Tanggal: r.createdAt.toISOString().split('T')[0],
        Nama: r.nama,
        Umur: r.usia,
        JK: r.jenisKelamin,
        Pendidikan: r.pendidikan,
        Pekerjaan: r.pekerjaan,
        Pegawai: r.pegawai?.nama || "-",
        U1: r.u1, U2: r.u2, U3: r.u3, U4: r.u4, U5: r.u5,
        U6: r.u6, U7: r.u7, U8: r.u8, U9: r.u9,
        Saran: r.saran || "-"
      }))
    };
  });

  return {
    periodLabel: activePeriod.label,
    data: reportData
  };
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