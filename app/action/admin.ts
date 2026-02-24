"use server";

import { prisma } from "@/lib/prisma";

// ... existing code ...

export async function getGlobalExportData() {
  // 1. Get Active Period
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" }
  });

  if (!activePeriod) return null;

  // 2. Fetch All Services with their Responses for this Period
  const services = await prisma.layanan.findMany({
    orderBy: { nama: 'asc' },
    include: {
      respon: {
        where: { periodeId: activePeriod.id },
        include: { pegawai: true } // Include Employee Name if needed
      }
    }
  });

  // 3. Process Data for Excel (Pre-calculate stats to save Client CPU)
  const reportData = services.map(service => {
    const responses = service.respon;
    const total = responses.length;

    // A. IKM Calculation
    let totalScore = 0;
    const sums = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // U1-U9
    
    responses.forEach(r => {
      totalScore += (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9);
      sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
      sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
      sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
    });

    const nrr = total > 0 ? totalScore / (9 * total) : 0;
    const ikm = nrr * 25;

    // B. Demographics
    const demographics = {
      gender: { L: 0, P: 0 },
      education: {} as Record<string, number>,
      job: {} as Record<string, number>
    };

    responses.forEach(r => {
      // Gender
      if (r.jenisKelamin === "Laki-laki") demographics.gender.L++;
      else demographics.gender.P++;
      
      // Edu
      demographics.education[r.pendidikan] = (demographics.education[r.pendidikan] || 0) + 1;
      
      // Job
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