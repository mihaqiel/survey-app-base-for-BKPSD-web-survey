import Image from "next/image";

export default function PublicHeader() {
  return (
    <header className="bg-white border-b-4 border-[#009CC5]">
      {/* TOP STRIPE */}
      <div className="h-2 bg-[#132B4F]" />
      <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #132B4F 66%)" }} />

      {/* LOGO ROW — 3 logos centered */}
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-center gap-8 md:gap-16">

        {/* Logo 1: Anambas */}
        <Image
          src="/logo-anambas.png"
          alt="Lambang Kepulauan Anambas"
          width={64}
          height={72}
          className="object-contain h-16 w-auto"
        />

        <div className="w-px h-12 bg-gray-200 hidden sm:block" />

        {/* Logo 2: Anambas Maju */}
        <Image
          src="/logo-anambas-maju.png"
          alt="Anambas Maju - Energi Baru"
          width={140}
          height={64}
          className="object-contain h-14 w-auto"
        />

        <div className="w-px h-12 bg-gray-200 hidden sm:block" />

        {/* Logo 3: BKPSDM */}
        <Image
          src="/logo-bkpsdm.png"
          alt="BKPSDM Anambas"
          width={100}
          height={64}
          className="object-contain h-14 w-auto"
        />
      </div>

      {/* TITLE BAR */}
      <div className="bg-[#132B4F]">
        <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FAE705] shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              Portal Survei Kepuasan Masyarakat (SKM)
            </p>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 hidden sm:block">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </header>
  );
}