import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getLayananDetail(id: string) {
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" },
  });

  const layanan = await prisma.layanan.findUnique({
    where: { id },
  });

  if (!layanan) return null;

  if (!activePeriod) {
    return { layanan, activePeriod: null, responses: [], employeeStats: [], ikm: 0, unsurAvg: [] };
  }

  const responses = await prisma.respon.findMany({
    where: { layananId: id, periodeId: activePeriod.id },
    include: { pegawai: true },
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;

  // IKM Calculation
  const sums = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  responses.forEach((r) => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  const totalScore = sums.reduce((a, b) => a + b, 0);
  const nrr = total > 0 ? totalScore / (9 * total) : 0;
  const ikm = nrr * 25;

  const unsurAvg = sums.map((s) => (total > 0 ? parseFloat((s / total).toFixed(2)) : 0));

  // Employee stats
  const statsMap = new Map<string, { id: string; nama: string; count: number; totalScore: number }>();
  responses.forEach((r) => {
    const empId = r.pegawaiId;
    const current = statsMap.get(empId) || { id: empId, nama: r.pegawai?.nama || "Unknown", count: 0, totalScore: 0 };
    const avg = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    current.count += 1;
    current.totalScore += avg * 25;
    statsMap.set(empId, current);
  });

  const employeeStats = Array.from(statsMap.values())
    .map((s) => ({ ...s, ikm: parseFloat((s.totalScore / s.count).toFixed(2)) }))
    .sort((a, b) => b.count - a.count);

  return { layanan, activePeriod, responses, employeeStats, ikm, unsurAvg };
}

function ikmLabel(ikm: number) {
  if (ikm >= 88.31) return { label: "Sangat Baik", color: "#16a34a" };
  if (ikm >= 76.61) return { label: "Baik", color: "#2563eb" };
  if (ikm >= 65.00) return { label: "Kurang Baik", color: "#d97706" };
  return { label: "Tidak Baik", color: "#dc2626" };
}

const UNSUR_LABELS = ["Persyaratan", "Sistem/Mekanisme", "Waktu Penyelesaian", "Biaya/Tarif", "Produk Layanan", "Kompetensi Pelaksana", "Perilaku Pelaksana", "Sarana & Prasarana", "Penanganan Pengaduan"];

export default async function LayananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLayananDetail(id);

  if (!data) notFound();

  const { layanan, activePeriod, responses, employeeStats, ikm, unsurAvg } = data;
  const ikmInfo = ikmLabel(ikm);
  const total = responses.length;

  // Demographics
  const genderCount = { "Laki-laki": 0, "Perempuan": 0 } as Record<string, number>;
  const educationCount = {} as Record<string, number>;
  responses.forEach((r) => {
    genderCount[r.jenisKelamin] = (genderCount[r.jenisKelamin] || 0) + 1;
    educationCount[r.pendidikan] = (educationCount[r.pendidikan] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <Link href="/admin/layanan" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 block transition-colors">
            ← Back to Services
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">{layanan.nama}</h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Period: {activePeriod?.label ?? "No Active Period"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total Responses: {total}
              </div>
              <div
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: ikmInfo.color }}
              >
                IKM: {ikm.toFixed(2)} — {ikmInfo.label}
              </div>
            </div>
          </div>
        </div>

        {!activePeriod && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-center text-red-500 font-bold">
            No active period found. Please create a period first.
          </div>
        )}

        {activePeriod && total === 0 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 mb-8 text-center text-yellow-600 font-bold">
            No responses yet for this service in the current period.
          </div>
        )}

        {total > 0 && (
          <>
            {/* IKM PER UNSUR */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Score per Unsur</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {UNSUR_LABELS.map((label, i) => {
                  const score = unsurAvg[i] ?? 0;
                  const pct = ((score - 1) / 3) * 100;
                  return (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">U{i + 1} — {label}</div>
                      <div className="text-2xl font-black text-black mb-2">{score.toFixed(2)}</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 rounded-full bg-black transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EMPLOYEE STATS */}
            {employeeStats.length > 0 && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-8 pb-0">
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Employee Performance</h2>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-4 pl-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Employee</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Responses</th>
                      <th className="py-4 pr-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">IKM Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employeeStats.map((emp) => {
                      const info = ikmLabel(emp.ikm);
                      return (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 pl-8 text-sm font-bold text-gray-800">{emp.nama}</td>
                          <td className="py-4 text-sm font-bold text-gray-500 text-center">{emp.count}</td>
                          <td className="py-4 pr-8 text-right">
                            <span
                              className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white"
                              style={{ backgroundColor: info.color }}
                            >
                              {emp.ikm} — {info.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* DEMOGRAPHICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Gender</h2>
                <div className="space-y-3">
                  {Object.entries(genderCount).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>{key}</span>
                        <span>{val} ({total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 rounded-full bg-black" style={{ width: `${(val / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Education</h2>
                <div className="space-y-3">
                  {Object.entries(educationCount).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>{key}</span>
                        <span>{val} ({total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 rounded-full bg-black" style={{ width: `${(val / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RECENT RESPONSES */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 pb-0">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Recent Responses</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-4 pl-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Employee</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                      <th className="py-4 pr-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {responses.slice(0, 20).map((r) => {
                      const avg = ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9).toFixed(2);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pl-8 text-sm font-bold text-gray-800">{r.nama}</td>
                          <td className="py-3 text-sm text-gray-500 font-medium">{r.pegawai?.nama || "-"}</td>
                          <td className="py-3 text-sm text-gray-400 font-medium">{new Date(r.createdAt).toLocaleDateString("id-ID")}</td>
                          <td className="py-3 pr-8 text-right text-sm font-black">{avg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}