import "./globals.css";
import type { Metadata } from "next";
import { BRAND } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: `${BRAND.appName} — ${BRAND.surveyOfficialName} ${BRAND.orgShort}`,
  description: `Platform digital pengukuran kinerja pelayanan publik ${BRAND.orgName} berdasarkan ${BRAND.surveyRegulation}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}