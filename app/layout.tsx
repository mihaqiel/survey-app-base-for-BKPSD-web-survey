import { ClerkProvider } from "@clerk/nextjs"; 
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased bg-black text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}