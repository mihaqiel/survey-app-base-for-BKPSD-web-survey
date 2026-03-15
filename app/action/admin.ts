"use server";

import { prisma } from "@/lib/prisma";

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
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  if (!activePeriod) return null;

  const services = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: {
      respon: {
        where: { periodeId: activePeriod.id },
        select: {
          u1: true, u2: true, u3: true, u4: true, u5: true,
          u6: true, u7: true, u8: true, u9: true,
          createdAt: true, jenisKelamin: true, nama: true,
          pegawaiId: true, tglLayanan: true,
        }
      }
    }
  });

  const totalResponses = services.reduce((acc: number, s: typeof services[0]) => acc + s.respon.length, 0);

  // ── Monthly trend data (last 6 months across all services)
  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    months.push({ label, start, end });
  }

  const allRespon = await prisma.respon.findMany({
    where: { periodeId: activePeriod.id },
    select: {
      createdAt: true, u1: true, u2: true, u3: true,
      u4: true, u5: true, u6: true, u7: true, u8: true, u9: true,
    }
  });

  const trendData = months.map(m => {
    const monthRespon = allRespon.filter((r: { createdAt: Date }) =>
      r.createdAt >= m.start && r.createdAt <= m.end
    );
    const count = monthRespon.length;
    let ikm = 0;
    if (count > 0) {
      const total = monthRespon.reduce((acc: number, r: UnsurFields) =>
        acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
      ikm = parseFloat(((total / (9 * count)) * 25).toFixed(2));
    }
    return { label: m.label, ikm, count };
  }).filter(m => m.count > 0);

  // ── Employee stats
  const pegawaiMap = new Map<string, { id: string; nama: string; count: number; totalScore: number }>();
  services.forEach((s: typeof services[0]) => {
    s.respon.forEach((r: any) => {
      if (!r.pegawaiId) return;
      const cur = pegawaiMap.get(r.pegawaiId) || { id: r.pegawaiId, nama: "", count: 0, totalScore: 0 };
      cur.count++;
      cur.totalScore += (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9);
      pegawaiMap.set(r.pegawaiId, cur);
    });
  });

  const pegawaiIds = Array.from(pegawaiMap.keys());
  const pegawaiRecords = pegawaiIds.length > 0
    ? await prisma.pegawai.findMany({ where: { id: { in: pegawaiIds } }, select: { id: true, nama: true } })
    : [];
  pegawaiRecords.forEach((p: { id: string; nama: string }) => {
    const cur = pegawaiMap.get(p.id);
    if (cur) { cur.nama = p.nama; pegawaiMap.set(p.id, cur); }
  });

  const employees = Array.from(pegawaiMap.values())
    .map(e => ({ id: e.id, nama: e.nama || "Unknown", count: e.count, ikm: parseFloat(((e.totalScore / (9 * e.count)) * 25).toFixed(2)) }))
    .sort((a, b) => b.ikm - a.ikm);

  // ── Recent responses
  const recentRaw = await prisma.respon.findMany({
    where: { periodeId: activePeriod.id },
    include: { layanan: { select: { nama: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const recentResponses = recentRaw.map((r: any) => {
    const avg = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    return {
      id: r.id,
      nama: r.nama,
      layanan: r.layanan?.nama ?? "—",
      tgl: new Date(r.createdAt).toLocaleDateString("id-ID"),
      ikm: parseFloat((avg * 25).toFixed(2)),
    };
  });

  // ── Gender data
  const genderRaw = await prisma.respon.groupBy({
    by: ["jenisKelamin"],
    where: { periodeId: activePeriod.id },
    _count: { id: true },
  });
  const gender = genderRaw.map((g: any) => ({ label: g.jenisKelamin || "Lainnya", count: g._count.id }));

  // ── Period dates
  const firstRespon = await prisma.respon.findFirst({
    where: { periodeId: activePeriod.id },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const lastRespon = await prisma.respon.findFirst({
    where: { periodeId: activePeriod.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return {
    periodLabel: activePeriod.label,
    periodStart: firstRespon ? fmt(new Date(firstRespon.createdAt)) : "",
    periodEnd:   lastRespon  ? fmt(new Date(lastRespon.createdAt))  : "",
    totalResponses,
    services: services.map((s: typeof services[0]) => {
      const total = s.respon.length;
      let ikm = 0;
      if (total > 0) {
        const totalScore = s.respon.reduce((acc: number, r: UnsurFields) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        ikm = parseFloat(((totalScore / (9 * total)) * 25).toFixed(1));
      }
      return { id: s.id, nama: s.nama, count: total, ikm };
    }),
    trendData,
    employees,
    recentResponses,
    gender,
  };
}

// ----------------------------------------------------------------------
// 2. PORTAL & SERVICE MANAGEMENT
// ----------------------------------------------------------------------
export async function getAllLayanan() {
  return await prisma.layanan.findMany({ orderBy: { nama: "asc" } });
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
    const current: EmployeeStat = statsMap.get(empId) || { id: empId, nama: r.pegawai?.nama || "Unknown", count: 0, totalWeightedScore: 0 };
    current.count += 1;
    current.totalWeightedScore += ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9) * 25;
    statsMap.set(empId, current);
  });

  return Array.from(statsMap.values())
    .map((s: EmployeeStat) => ({ id: s.id, nama: s.nama, count: s.count, ikm: parseFloat((s.totalWeightedScore / s.count).toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ----------------------------------------------------------------------
// 4. EXCEL EXPORT
// ----------------------------------------------------------------------
export async function getGlobalExportData() {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  if (!activePeriod) return null;

  const services = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: { respon: { where: { periodeId: activePeriod.id }, include: { pegawai: true } } }
  });

  return {
    periodLabel: activePeriod.label,
    data: services.map((service: typeof services[0]) => ({
      serviceName: service.nama,
      totalRespondents: service.respon.length,
      rawResponses: service.respon.map((r: typeof service.respon[0], i: number) => ({
        No: i + 1,
        Tanggal: r.tglLayanan ? new Date(r.tglLayanan).toLocaleDateString("id-ID") : new Date(r.createdAt).toLocaleDateString("id-ID"),
        Nama: r.nama, Umur: r.usia, JK: r.jenisKelamin,
        Pendidikan: r.pendidikan, Pekerjaan: r.pekerjaan,
        Difabel: r.isDifabel ?? "Tidak", JenisDisabilitas: r.jenisDisabilitas ?? "-",
        Pegawai: r.pegawai?.nama || "-",
        U1: r.u1, U2: r.u2, U3: r.u3, U4: r.u4, U5: r.u5,
        U6: r.u6, U7: r.u7, U8: r.u8, U9: r.u9,
        Saran: r.saran || "-",
      }))
    }))
  };
}

// ----------------------------------------------------------------------
// 5. SERVICE MANAGEMENT (CRUD)
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
  return await prisma.pegawai.findMany({ orderBy: { nama: "asc" } });
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