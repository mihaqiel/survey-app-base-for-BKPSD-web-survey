export default function PortalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#0d1b2a" }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-[#FAE705] animate-spin" style={{ borderColor: "rgba(250,231,5,0.20)", borderTopColor: "#FAE705" }} />
      <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.40)" }}>
        Memuat Portal Survei...
      </p>
    </div>
  );
}
