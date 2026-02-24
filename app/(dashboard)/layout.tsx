import Sidebar from "./admin/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <main className="ml-64 p-8"> {/* ml-64 pushes content right of sidebar */}
        {children}
      </main>
    </div>
  );
}