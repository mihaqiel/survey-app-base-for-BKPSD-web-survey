import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";
import GlobalExportButton from "./GlobalExportButton";

function ikmColor(ikm: number) {
  if (ikm === 0) return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65.00) return "#d97706";
  return "#dc2626";
}

function ikmLabel(ikm: number) {
  if (ikm === 0) return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

function IkmBadge({ ikm }: { ikm: number }) {
  return (
    <span
      className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white"
      style={{ backgroundColor: ikmColor(ikm) }}
    >
      {ikmLabel(ikm)}
    </span>
  );
}

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
        <p className="text-xs font-mono uppercase tracking-widest mb-4 text-gray-400">System Not Initialized</p>
        <Link href="/admin/settings" className="px-6 py-3 text-white text-xs font-black uppercase tracking-widest bg-[#132B4F]">
          Go to Settings →
        </Link>
      </div>
    );
  }

  // ── Extra data ────────────────────────────────────────────────────────────

  // Per-pegawai performance (top 8 by response count)
  const pegawaiStats = await prisma.respon.groupBy({
    by: ["pegawaiId"],
    _count: { id: true },
    _avg: { u1: true, u2: true, u3: true, u4: true, u5: true, u6: true, u7: true, u8: true, u9: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const pegawaiNames = await prisma.pegawai.findMany({
    where: { id: { in: pegawaiStats.map(p => p.pegawaiId) } },
    select: { id: true, nama: true },
  });
  const nameMap = Object.fromEntries(pegawaiNames.map(p => [p.id, p.nama]));

  const pegawaiRows = pegawaiStats.map(p => {
    const vals = [p._avg.u1, p._avg.u2, p._avg.u3, p._avg.u4, p._avg.u5, p._avg.u6, p._avg.u7, p._avg.u8, p._avg.u9];
    const numericVals = vals.filter((v): v is number => v !== null);
    const avg = numericVals.length > 0 ? numericVals.reduce((a, b) => a + b, 0) / 9 : 0;
    const ikm = parseFloat((avg * 25).toFixed(1));
    return { id: p.pegawaiId, nama: nameMap[p.pegawaiId] ?? "Unknown", count: p._count.id, ikm };
  }).sort((a, b) => b.ikm - a.ikm);

  // Latest saran (non-empty)
  const latestSaran = await prisma.respon.findMany({
    where: { AND: [{ saran: { not: null } }, { saran: { not: "" } }] },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      saran: true,
      nama: true,
      createdAt: true,
      layanan: { select: { nama: true } },
    },
  });

  // ── Derived stats ─────────────────────────────────────────────────────────
  const overallIkm = stats.totalResponses > 0
    ? parseFloat((stats.services.reduce((acc, s) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const servicesWithData = stats.services.filter(s => s.count > 0);
  const top5 = [...stats.services].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = Math.max(...top5.map(s => s.count), 1);

  const ikmChartData = servicesWithData
    .sort((a, b) => b.ikm - a.ikm)
    .map(s => ({
      name: s.nama.length > 22 ? s.nama.substring(0, 22) + "…" : s.nama,
      ikm: s.ikm,
      fill: ikmColor(s.ikm),
    }));

  const best = servicesWithData.length > 0
    ? servicesWithData.reduce((a, b) => a.ikm > b.ikm ? a : b)
    : null;

  const sortedByIkm = [...servicesWithData].sort((a, b) => b.ikm - a.ikm);
  const top3 = sortedByIkm.slice(0, 3);
  const bottom3 = sortedByIkm.length > 3 ? sortedByIkm.slice(-3).reverse() : [];

  return (
    <div className="min-h-screen lg:h-screen font-sans flex flex-col overflow-x-hidden bg-[#F0F4F8]">

      {/* TOP NAV BAR */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 lg:hidden" />
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] hidden sm:block">BKPSDM Kepulauan Anambas</p>
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">Dashboard SKM</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#FAE705]/20 px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#132B4F]">Sistem Aktif</span>
          </div>
          <div className="hidden sm:block"><GlobalExportButton /></div>
          <form action={logout}>
            <button className="px-3 lg:px-4 py-2 bg-white border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
              Log Out
            </button>
          </form>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4 lg:gap-5">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 shrink-0">
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1 bg-[#009CC5]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#009CC5] mb-2">Total Responden</p>
                <p className="text-3xl lg:text-4xl font-black text-[#132B4F] leading-none">{stats.totalResponses}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1 bg-[#FAE705]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Layanan</p>
                <p className="text-3xl lg:text-4xl font-black text-[#132B4F] leading-none">{stats.services.length}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-3">{servicesWithData.length} memiliki respons</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1" style={{ backgroundColor: overallIkm > 0 ? ikmColor(overallIkm) : "#e2e8f0" }} />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Overall IKM</p>
                <p className="text-3xl lg:text-4xl font-black leading-none" style={{ color: ikmColor(overallIkm) }}>
                  {overallIkm > 0 ? overallIkm : "—"}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(overallIkm) }}>
                  {ikmLabel(overallIkm)}
                </p>
              </div>
            </div>

            <div className="bg-[#132B4F] overflow-hidden">
              <div className="h-1 bg-[#FAE705]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Layanan Terbaik</p>
                {best ? (
                  <>
                    <p className="text-sm font-black text-white leading-tight line-clamp-2">{best.nama}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(best.ikm) }}>
                      IKM {best.ikm}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-black text-white/30 mt-1">Belum ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2: CHART + TOP LAYANAN + TOP/BOTTOM IKM */}
          <div className="flex flex-col lg:flex-row gap-4 lg:flex-1 lg:min-h-0">

            {/* IKM CHART */}
            <div className="bg-white border border-gray-200 flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-[#132B4F] via-[#009CC5] to-[#FAE705]" />
              <div className="px-4 lg:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">IKM per Layanan</h3>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-600 inline-block" />Sangat Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 inline-block" style={{ backgroundColor: "#009CC5" }} />Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 inline-block" />Kurang Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 inline-block" />Tidak Baik</span>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-4" style={{ minHeight: "280px" }}>
                {ikmChartData.length > 0 ? (
                  <DashboardCharts data={ikmChartData} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-[#F0F4F8] flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* TOP 5 LAYANAN */}
            <div className="bg-white border border-gray-200 lg:w-56 shrink-0 flex flex-col overflow-hidden">
              <div className="h-0.5 bg-[#FAE705]" />
              <div className="px-4 lg:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Top Layanan</h3>
                </div>
                <Link href="/admin/layanan" className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua →
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {top5.map((svc, i) => (
                  <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F0F4F8] transition-colors group"
                  >
                    <div className="w-7 h-7 flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{
                        backgroundColor: i === 0 ? "#FAE705" : i === 1 ? "#132B4F" : "#F0F4F8",
                        color: i === 1 ? "white" : "#132B4F",
                      }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-[#132B4F]">{svc.nama}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#009CC5]" style={{ width: `${(svc.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 shrink-0">{svc.count}</span>
                      </div>
                    </div>
                    {svc.ikm > 0 && (
                      <span className="text-[10px] font-black shrink-0" style={{ color: ikmColor(svc.ikm) }}>
                        {svc.ikm}
                      </span>
                    )}
                  </Link>
                ))}
                {top5.every(s => s.count === 0) && (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">Belum ada respons</p>
                  </div>
                )}
              </div>
            </div>

            {/* TOP 3 & BOTTOM 3 IKM */}
            <div className="flex flex-col gap-4 lg:w-48 shrink-0">
              <div className="bg-white border border-gray-200 overflow-hidden flex-1">
                <div className="h-0.5 bg-green-500" />
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-green-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">🏆 Tertinggi</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {top3.length === 0 ? (
                    <p className="px-4 py-4 text-[10px] font-black text-gray-300 uppercase">Belum ada data</p>
                  ) : top3.map((s, i) => (
                    <div key={s.id} className="px-4 py-3 flex items-center gap-2">
                      <span className="text-[9px] font-black text-gray-300 w-3 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#132B4F] truncate leading-tight">{s.nama}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${s.ikm}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-green-600 shrink-0">{s.ikm}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 overflow-hidden flex-1">
                <div className="h-0.5 bg-red-400" />
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-red-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">⚠ Perlu Perhatian</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {bottom3.length === 0 ? (
                    <p className="px-4 py-4 text-[10px] font-black text-gray-300 uppercase">Belum ada data</p>
                  ) : bottom3.map((s, i) => (
                    <div key={s.id} className="px-4 py-3 flex items-center gap-2">
                      <span className="text-[9px] font-black text-gray-300 w-3 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#132B4F] truncate leading-tight">{s.nama}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${s.ikm}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-red-500 shrink-0">{s.ikm}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: PEGAWAI TABLE + SARAN FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* PEGAWAI PERFORMANCE */}
            <div className="lg:col-span-2 bg-white border border-gray-200 overflow-hidden">
              <div className="h-0.5 bg-[#FAE705]" />
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa Pegawai</h3>
                </div>
                <Link href="/admin/pegawai" className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#132B4F" }}>
                      {["#", "Nama Pegawai", "Responden", "IKM", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pegawaiRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">
                          Belum ada data
                        </td>
                      </tr>
                    ) : pegawaiRows.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-3 text-[10px] font-black text-gray-300">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#132B4F]">{p.nama}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] text-[9px] font-black">{p.count}x</span>
                        </td>
                        <td className="px-4 py-3 font-black" style={{ color: ikmColor(p.ikm) }}>{p.ikm}</td>
                        <td className="px-4 py-3"><IkmBadge ikm={p.ikm} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SARAN TERBARU */}
            <div className="bg-white border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-0.5 bg-[#009CC5]" />
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <div className="w-0.5 h-4 bg-[#009CC5]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">💬 Saran Terbaru</h3>
              </div>
              <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                {latestSaran.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">Belum ada saran</p>
                  </div>
                ) : latestSaran.map((s) => (
                  <div key={s.id} className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1 h-3 bg-[#009CC5] shrink-0" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] truncate">
                        {s.layanan?.nama ?? "Layanan"}
                      </p>
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed line-clamp-3">
                      &ldquo;{s.saran}&rdquo;
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[9px] font-bold text-gray-300">{s.nama}</p>
                      <p className="text-[9px] font-bold text-gray-300">
                        {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}