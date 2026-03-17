export default function PortalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-xs font-semibold text-gray-400">
        Memuat Portal Survei...
      </p>
    </div>
  );
}
