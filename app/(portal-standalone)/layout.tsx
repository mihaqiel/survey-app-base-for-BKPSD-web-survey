export default function PortalStandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen antialiased" style={{ background: "#0d1b2a" }}>
      {children}
    </div>
  );
}
