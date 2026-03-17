export default function PortalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Memuat Portal Survei...
      </p>
    </div>
  );
}
