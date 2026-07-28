import { prisma } from "@/lib/prisma";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penghargaan ASN — BKPSDM Anambas",
  description: "Daftar ASN penerima penghargaan dari BKPSDM Kabupaten Kepulauan Anambas.",
};

export const revalidate = 60;

export default async function PenghargaanPublikPage() {
  const data = await prisma.penghargaan.findMany({
    where: { isPublished: true },
    orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nama: true,
      jabatan: true,
      unitKerja: true,
      periode: true,
      kategori: true,
      fotoUrl: true,
    },
  });

  if (data.length === 0) return null;

  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-blue-600 mb-3">
          Apresiasi Kinerja
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
          Penghargaan ASN
        </h1>
        <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
          ASN BKPSDM Kabupaten Kepulauan Anambas yang menerima penghargaan atas dedikasi dan kinerja terbaik.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(r => (
          <article
            key={r.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Photo */}
            <div className="relative aspect-square bg-gray-100">
              {r.fotoUrl ? (
                <Image
                  src={r.fotoUrl}
                  alt={`Foto ${r.nama}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-5xl text-gray-200">★</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-700 rounded-full border border-blue-100">
                  {r.kategori}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {r.periode}
              </p>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{r.nama}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{r.jabatan}</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Unit Kerja</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{r.unitKerja}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
