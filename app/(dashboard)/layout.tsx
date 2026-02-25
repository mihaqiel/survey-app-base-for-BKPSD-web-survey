import Sidebar from "./admin/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </div>
  );
}