import PublicHeader from "@/app/(public)/components/PublicHeader";

export default function PublicNoFooterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
