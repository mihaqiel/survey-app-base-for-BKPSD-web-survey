import PublicHeader from "@/app/(public)/components/PublicHeader";
import PublicFooter from "@/app/(public)/components/PublicFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#132B4F] antialiased flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}