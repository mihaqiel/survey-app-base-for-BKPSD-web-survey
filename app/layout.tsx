import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survei Kepuasan Masyarakat — BKPSDM Kab. Kepulauan Anambas",
  description:
    "Platform digital pengukuran kinerja pelayanan publik BKPSDM Kabupaten Kepulauan Anambas berdasarkan Permenpan RB No. 14 Tahun 2017.",
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