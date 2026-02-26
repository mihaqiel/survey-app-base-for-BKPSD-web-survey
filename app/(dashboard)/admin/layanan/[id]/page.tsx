import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import LayananExportButton from "@/app/(dashboard)/admin/components/LayananExportButton";

async function getLayananDetail(id: string) {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const layanan = await prisma.layanan.findUnique({ where: { id } });
  if (!layanan) return null;

  if (!activePeriod) return { layanan, activePeriod: null, responses: [], employeeStats: [], ikm: 0, unsurAvg: [] };

  const responses = await prisma.respon.findMany({
    where: { layananId: id, periodeId: activePeriod.id },
    include: { pegawai: true },
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  const sums = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  responses.forEach((r: (typeof responses)[0]) => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  const totalScore = sums.reduce((a, b) => a + b, 0);
  const ikm = total > 0 ? (totalScore / (9 * total)) * 25 : 0;
  const unsurAvg = sums.map(s => total > 0 ? parseFloat((s / total).toFixed(2)) : 0);

  const statsMap = new Map<string, { id: string; nama: string; count: number; totalScore: number }>();
  responses.forEach((r: (typeof responses)[0]) => {
    const empId = r.pegawaiId;
    const current = statsMap.get(empId) || { id: empId, nama: r.pegawai?.nama || "Unknown", count: 0, totalScore: 0 };
    current.count += 1;
    current.totalScore += ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9) * 25;
    statsMap.set(empId, current);
  });

  const employeeStats = Array.from(statsMap.values())
    .map(s => ({ ...s, ikm: parseFloat((s.totalScore / s.count).toFixed(2)) }))
    .sort((a, b) => b.count - a.count);

  return { layanan, activePeriod, responses, employeeStats, ikm, unsurAvg };
}

function ikmInfo(ikm: number) {
  if (ikm >= 88.31) return { label: "Sangat Baik", color: "#16a34a" };
  if (ikm >= 76.61) return { label: "Baik", color: "#009CC5" };
  if (ikm >= 65.0)  return { label: "Kurang Baik", color: "#d97706" };
  return { label: "Tidak Baik", color: "#dc2626" };
}

const UNSUR_LABELS = [
  "Persyaratan", "Sistem/Mekanisme", "Waktu Penyelesaian",
  "Biaya/Tarif", "Produk Layanan", "Kompetensi Pelaksana",
  "Perilaku Pelaksana", "Sarana & Prasarana", "Penanganan Pengaduan",
];

export default async function LayananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLayananDetail(id);
  if (!data) notFound();

  const { layanan, activePeriod, responses, employeeStats, ikm, unsurAvg } = data;
  const info = ikmInfo(ikm);
  const total = responses.length;

  const genderCount = { "Laki-laki": 0, Perempuan: 0 } as Record<string, number>;
  const educationCount = {} as Record<string, number>;
  responses.forEach((r: (typeof responses)[0]) => {
    genderCount[r.jenisKelamin] = (genderCount[r.jenisKelamin] || 0) + 1;
    educationCount[r.pendidikan] = (educationCount[r.pendidikan] || 0) + 1;
  });

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-7 bg-[#FAE705]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Analitik Layanan</p>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none line-clamp-1">{layanan.nama}</h1>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Periode: {activePeriod?.label ?? "Tidak Ada Periode Aktif"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin/layanan"
              className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
              ← Layanan
            </Link>
            <div className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
              {total} Responden
            </div>
            {total > 0 && (
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: info.color }}>
                IKM {ikm.toFixed(2)} — {info.label}
              </div>
            )}
            {total > 0 && (
              <LayananExportButton
                layananNama={layanan.nama}
                periodLabel={activePeriod?.label ?? ""}
                responses={responses}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">

        {/* NO PERIOD */}
        {!activePeriod && (
          <div className="bg-white border border-red-200 overflow-hidden">
            <div className="h-0.5 bg-red-500" />
            <div className="px-6 py-4 text-center text-red-500 font-bold text-sm">
              Tidak ada periode aktif. Silakan buat periode terlebih dahulu.
            </div>
          </div>
        )}

        {/* NO DATA */}
        {activePeriod && total === 0 && (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-[#FAE705]" />
            <div className="px-6 py-12 flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada respons untuk layanan ini</p>
            </div>
          </div>
        )}

        {total > 0 && (
          <>
            {/* IKM PER UNSUR */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-0.5 bg-[#009CC5]" />
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#009CC5]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Skor per Unsur Penilaian</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {UNSUR_LABELS.map((label, i) => {
                  const score = unsurAvg[i] ?? 0;
                  const pct = ((score - 1) / 3) * 100;
                  const ikmScore = score * 25;
                  const barColor = ikmScore >= 88.31 ? "#16a34a" : ikmScore >= 76.61 ? "#009CC5" : ikmScore >= 65 ? "#d97706" : "#dc2626";
                  return (
                    <div key={i} className="bg-[#F0F4F8] border border-gray-200 p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        U{i + 1} — {label}
                      </p>
                      <p className="text-2xl font-black text-[#132B4F] mb-2">{score.toFixed(2)}</p>
                      <div className="w-full h-1.5 bg-gray-200 overflow-hidden">
                        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EMPLOYEE STATS */}
            {employeeStats.length > 0 && (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5)" }} />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#132B4F]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa Pegawai</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#132B4F]">
                        <th className="py-3 pl-6 text-[9px] font-black uppercase tracking-widest text-white">Pegawai</th>
                        <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white text-center">Responden</th>
                        <th className="py-3 pr-6 text-[9px] font-black uppercase tracking-widest text-white text-right">IKM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeStats.map((emp, i) => {
                        const ei = ikmInfo(emp.ikm);
                        return (
                          <tr key={emp.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}>
                            <td className="py-3.5 pl-6 text-sm font-bold text-[#132B4F]">{emp.nama}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] text-xs font-black">{emp.count}</span>
                            </td>
                            <td className="py-3.5 pr-6 text-right">
                              <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: ei.color }}>
                                {emp.ikm} — {ei.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DEMOGRAPHICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Jenis Kelamin", data: Object.entries(genderCount) },
                { title: "Pendidikan", data: Object.entries(educationCount).sort((a, b) => b[1] - a[1]) },
              ].map(({ title, data }) => (
                <div key={title} className="bg-white border border-gray-200 overflow-hidden">
                  <div className="h-0.5 bg-[#FAE705]" />
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#FAE705]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">{title}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {data.map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-bold text-[#132B4F]">{key}</span>
                          <span className="text-sm font-black text-[#009CC5]">{val} <span className="text-gray-400 font-medium">({total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#009CC5]" style={{ width: `${(val / total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT RESPONSES */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-0.5" style={{ background: "linear-gradient(to right, #FAE705, #009CC5, #132B4F)" }} />
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-[#009CC5] to-[#132B4F]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Respons Terbaru</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#132B4F]">
                      {["Nama", "Pegawai", "Tanggal", "Rata-rata"].map((h, i) => (
                        <th key={h} className={`py-3 text-[9px] font-black uppercase tracking-widest text-white ${i === 0 ? "pl-6" : "px-4"} ${i === 3 ? "pr-6 text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {responses.slice(0, 20).map((r: (typeof responses)[0], i) => {
                      const avg = ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9).toFixed(2);
                      return (
                        <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}>
                          <td className="py-3.5 pl-6 text-sm font-bold text-[#132B4F]">{r.nama}</td>
                          <td className="py-3.5 px-4 text-sm text-gray-500 font-medium">{r.pegawai?.nama || "—"}</td>
                          <td className="py-3.5 px-4 text-sm text-gray-400 font-medium">
                            {new Date(r.tglLayanan ?? r.createdAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-3.5 pr-6 text-right">
                            <span className="text-sm font-black text-[#132B4F]">{avg}</span>
                          </td>
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