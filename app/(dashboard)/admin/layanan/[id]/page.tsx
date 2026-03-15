import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import LayananExportButton from "@/app/(dashboard)/admin/components/LayananExportButton";
import LayananDetailCharts from "@/app/(dashboard)/admin/components/LayananDetailCharts";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  AlertTriangle, Award, BarChart3, Bell,
  CalendarDays, ChevronRight, Search, Users,
} from "lucide-react";

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

function ikmBg(ikm: number) {
  if (ikm === 0)    return "bg-gray-100 text-gray-400";
  if (ikm >= 88.31) return "bg-green-50 text-green-700";
  if (ikm >= 76.61) return "bg-sky-50 text-sky-700";
  if (ikm >= 65.0)  return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
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
  const total = responses.length;

  const genderCount  = { "Laki-laki": 0, Perempuan: 0 } as Record<string, number>;
  const eduCount     = {} as Record<string, number>;
  responses.forEach((r: (typeof responses)[0]) => {
    genderCount[r.jenisKelamin] = (genderCount[r.jenisKelamin] || 0) + 1;
    eduCount[r.pendidikan]      = (eduCount[r.pendidikan] || 0) + 1;
  });

  const bestUnsurIdx  = unsurAvg.length > 0 ? unsurAvg.reduce((best, v, i, arr) => v > arr[best] ? i : best, 0) : 0;
  const worstUnsurIdx = unsurAvg.length > 0 ? unsurAvg.reduce((worst, v, i, arr) => v < arr[worst] ? i : worst, 0) : 0;

  // Build trend data: single data point for current period (expand with real historical data later)
  const trendData = total > 0 ? [
    { label: activePeriod?.label ?? "Periode Aktif", ikm: parseFloat(ikm.toFixed(2)), count: total },
  ] : [];

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 lg:hidden shrink-0" />
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <Breadcrumb items={[
              { label: "Admin", href: "/admin" },
              { label: "Layanan SKM", href: "/admin/layanan" },
              { label: layanan.nama },
            ]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5 line-clamp-1">
              {layanan.nama}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F4F8] border border-gray-200">
            <Users className="w-3.5 h-3.5 text-[#009CC5]" />
            <span className="text-[10px] font-black text-[#132B4F]">{total} Responden</span>
          </div>
          {total > 0 && (
            <LayananExportButton layananNama={layanan.nama} periodLabel={activePeriod?.label ?? ""} responses={responses} />
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex items-center">
          {["Performa Layanan", "Daftar Responden", "Pengaturan"].map((tab, i) => (
            <button key={tab}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-150 whitespace-nowrap ${
                i === 0
                  ? "border-[#009CC5] text-[#009CC5]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* NO PERIOD */}
        {!activePeriod && (
          <div className="animate-fade-up bg-white border border-red-200 overflow-hidden">
            <div className="h-0.5 bg-red-500" />
            <div className="px-6 py-4 flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="font-bold text-sm">Tidak ada periode aktif. Silakan buat periode terlebih dahulu.</p>
            </div>
          </div>
        )}

        {activePeriod && (
          <>
            {/* METRIC CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
              {[
                {
                  label: "Total Responden",
                  value: total,
                  sub: <p className="text-[9px] font-bold text-gray-400 mt-2">{activePeriod.label}</p>,
                  accent: "#009CC5",
                  icon: <Users className="w-4 h-4" />,
                },
                {
                  label: "IKM Layanan",
                  value: total > 0 ? ikm.toFixed(2) : "—",
                  sub: total > 0 ? <div className="mt-2"><StatusBadge ikm={ikm} size="sm" /></div> : null,
                  accent: ikmColor(ikm),
                  icon: <BarChart3 className="w-4 h-4" />,
                },
                {
                  label: "Elemen Terbaik",
                  value: unsurAvg.length > 0 ? `U${bestUnsurIdx + 1}` : "—",
                  sub: <p className="text-[9px] font-bold text-gray-400 mt-2 truncate">{UNSUR_LABELS[bestUnsurIdx]}</p>,
                  accent: "#16a34a",
                  icon: <Award className="w-4 h-4" />,
                },
                {
                  label: "Perlu Perhatian",
                  value: unsurAvg.length > 0 ? `U${worstUnsurIdx + 1}` : "—",
                  sub: <p className="text-[9px] font-bold text-gray-400 mt-2 truncate">{UNSUR_LABELS[worstUnsurIdx]}</p>,
                  accent: "#d97706",
                  icon: <AlertTriangle className="w-4 h-4" />,
                },
              ].map((card) => (
                <div key={card.label} className="bg-white border border-gray-200 overflow-hidden card-hover">
                  <div className="h-1 animate-draw-line" style={{ backgroundColor: card.accent }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</p>
                      <span style={{ color: card.accent }} className="opacity-30">{card.icon}</span>
                    </div>
                    <p className="text-3xl font-black leading-none" style={{ color: card.accent }}>{card.value}</p>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* CHARTS — Line Trend + 3 Element Bar Charts */}
            {total > 0 && (
              <LayananDetailCharts unsurAvg={unsurAvg} trendData={trendData} ikm={ikm} />
            )}

            {/* UNSUR ANALYSIS TABLE */}
            {total > 0 && (
              <div className="animate-fade-up bg-white border border-gray-200 overflow-hidden">
                <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #009CC5, #FAE705)" }} />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-0.5 h-5 bg-[#009CC5]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Analisis Unsur SKM</p>
                  <span className="ml-auto text-[9px] font-bold text-gray-400">9 unsur Permenpan RB 14/2017</span>
                </div>
                <div className="p-6 space-y-3">
                  {UNSUR_LABELS.map((label, i) => {
                    const score    = unsurAvg[i] ?? 0;
                    const ikmScore = score * 25;
                    const barColor = ikmColor(ikmScore);
                    const pct      = ((score - 1) / 3) * 100;
                    const isBest   = i === bestUnsurIdx;
                    const isWorst  = i === worstUnsurIdx;
                    return (
                      <div key={i}
                        className={`flex items-center gap-4 p-3 transition-colors duration-150 animate-fade-up rounded ${isBest ? "bg-green-50/50" : isWorst ? "bg-red-50/50" : "hover:bg-gray-50/50"}`}
                        style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="w-8 h-8 flex items-center justify-center text-[9px] font-black text-white shrink-0 rounded" style={{ backgroundColor: barColor }}>
                          U{i + 1}
                        </div>
                        <div className="w-40 shrink-0">
                          <p className="text-[10px] font-black text-[#132B4F] leading-tight">{label}</p>
                          {isBest  && <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Terbaik</span>}
                          {isWorst && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Perlu perhatian</span>}
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 overflow-hidden rounded-full">
                          <div className="h-full progress-bar transition-all duration-700 rounded-full"
                            style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: barColor }} />
                        </div>
                        <div className="text-right shrink-0 w-20">
                          <p className="text-sm font-black" style={{ color: barColor }}>{score.toFixed(2)}</p>
                          <p className="text-[8px] font-bold text-gray-400">IKM {ikmScore.toFixed(1)}</p>
                        </div>
                        <StatusBadge ikm={ikmScore} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMPLOYEE TABLE */}
            {employeeStats.length > 0 && (
              <div className="animate-fade-up delay-225 bg-white border border-gray-200 overflow-hidden">
                <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #132B4F, #009CC5)" }} />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-0.5 h-5 bg-[#132B4F]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa Pegawai</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#132B4F]">
                        {["#", "Pegawai", "Responden", "IKM", "Status"].map((h, i) => (
                          <th key={h} className={`py-3 text-[9px] font-black uppercase tracking-widest text-white ${i === 0 ? "pl-6 w-10" : "px-4"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeStats.map((emp, i) => (
                        <tr key={emp.id}
                          className={`transition-colors hover:bg-[#F0F4F8]/60 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/40"}`}
                          style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}>
                          <td className="py-3.5 pl-6">
                            <div className={`w-6 h-6 flex items-center justify-center text-[9px] font-black rounded ${i === 0 ? "bg-[#FAE705] text-[#132B4F]" : i === 1 ? "bg-[#132B4F] text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                          </td>
                          <td className="py-3.5 px-4 text-sm font-bold text-[#132B4F]">{emp.nama}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] text-xs font-black rounded">{emp.count}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-black" style={{ color: ikmColor(emp.ikm) }}>{emp.ikm}</span>
                          </td>
                          <td className="py-3.5 px-4"><StatusBadge ikm={emp.ikm} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DEMOGRAPHICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Jenis Kelamin", data: Object.entries(genderCount) },
                { title: "Pendidikan",    data: Object.entries(eduCount).sort((a, b) => b[1] - a[1]) },
              ].map(({ title, data }, si) => (
                <div key={title} className={`animate-fade-up bg-white border border-gray-200 overflow-hidden card-hover ${si === 0 ? "delay-75" : "delay-150"}`}>
                  <div className="h-0.5 bg-[#FAE705] animate-draw-line" />
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-0.5 h-5 bg-[#FAE705]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">{title}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {data.map(([key, val], i) => (
                      <div key={key} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-bold text-[#132B4F]">{key}</span>
                          <span className="text-sm font-black text-[#009CC5]">
                            {val} <span className="text-gray-400 font-medium text-xs">({total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#009CC5] rounded-full progress-bar" style={{ width: `${(val / total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT RESPONSES TABLE */}
            <div className="animate-fade-up delay-225 bg-white border border-gray-200 overflow-hidden">
              <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #FAE705, #009CC5, #132B4F)" }} />
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-0.5 h-5 bg-[#009CC5]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Responden</p>
                <span className="ml-auto text-[9px] font-bold text-gray-400">Menampilkan {Math.min(20, total)} dari {total}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#132B4F]">
                      {["#", "Nama", "Pegawai", "Tanggal", "IKM", "Status"].map((h, i) => (
                        <th key={h} className={`py-3 text-[9px] font-black uppercase tracking-widest text-white ${i === 0 ? "pl-6 w-10" : "px-4"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {responses.slice(0, 20).map((r: (typeof responses)[0], i) => {
                      const avg = ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9);
                      const ikmAvg = avg * 25;
                      return (
                        <tr key={r.id}
                          className={`transition-colors hover:bg-[#F0F4F8]/50 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/40"}`}
                          style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}>
                          <td className="py-3 pl-6 text-[10px] font-black text-gray-300">{i + 1}</td>
                          <td className="py-3 px-4 text-sm font-bold text-[#132B4F]">{r.nama}</td>
                          <td className="py-3 px-4 text-sm text-gray-500 font-medium">{r.pegawai?.nama || "—"}</td>
                          <td className="py-3 px-4 text-sm text-gray-400 font-medium whitespace-nowrap">
                            {new Date(r.tglLayanan ?? r.createdAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-sm font-black" style={{ color: ikmColor(ikmAvg) }}>{avg.toFixed(2)}</td>
                          <td className="py-3 px-4"><StatusBadge ikm={ikmAvg} size="sm" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activePeriod && total === 0 && (
          <div className="animate-fade-up bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-[#009CC5]" />
            <div className="px-6 py-16 flex flex-col items-center justify-center gap-3">
              <BarChart3 className="w-12 h-12 text-gray-200" />
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">Belum ada survei untuk layanan ini</p>
              <p className="text-[10px] text-gray-300 font-medium">Responden akan muncul setelah mengisi formulir survei</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}