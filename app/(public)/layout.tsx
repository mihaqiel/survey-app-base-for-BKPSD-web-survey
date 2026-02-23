export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // This firewall ensures the Admin Sidebar never loads for respondents
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      {children}
    </div>
  );
}