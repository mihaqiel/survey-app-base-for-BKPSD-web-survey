import Image from "next/image";

export default function PublicHeader() {
  return (
    <header className="bg-white border-b-4 border-[#009CC5]">
      {/* TOP STRIPE */}
      <div className="h-1.5 bg-gradient-to-r from-[#132B4F] via-[#009CC5] to-[#FAE705]" />

      {/* LOGO ROW */}
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center gap-8 md:gap-16">
        {/* Logo 1: Kepulauan Anambas */}
        <div className="flex items-center justify-center">
          <Image
            src="/logo-anambas.png"
            alt="Lambang Kepulauan Anambas"
            width={64}
            height={72}
            className="object-contain h-16 w-auto"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 hidden sm:block" />

        {/* Logo 2: Anambas Maju */}
        <div className="flex items-center justify-center">
          <Image
            src="/logo-anambas-maju.png"
            alt="Anambas Maju - Energi Baru"
            width={140}
            height={64}
            className="object-contain h-14 w-auto"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 hidden sm:block" />

        {/* Logo 3: BKPSDM */}
        <div className="flex items-center justify-center">
          <Image
            src="/logo-bkpsdm.png"
            alt="BKPSDM Anambas"
            width={100}
            height={64}
            className="object-contain h-14 w-auto"
          />
        </div>
      </div>

      {/* TITLE BAR */}
      <div className="bg-[#132B4F] py-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
          Badan Kepegawaian & Pengembangan SDM
        </p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
          Kabupaten Kepulauan Anambas
        </p>
      </div>
    </header>
  );
}