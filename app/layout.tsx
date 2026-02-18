import { ClerkProvider } from "@clerk/nextjs"; // 1. Import the provider
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Wrap the entire HTML structure
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased bg-black text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}