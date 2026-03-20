/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig = {
  // Prevent Turbopack from bundling Prisma inline into server chunks.
  // Without this, `prisma generate` regenerates node_modules but the
  // cached compiled chunk (content-addressed) still embeds the old schema,
  // causing P2021 "table does not exist" on every deploy.
  serverExternalPackages: ["@prisma/client", "prisma"],

  headers: () => Promise.resolve([{ source: "/:path*", headers: securityHeaders }]),

  // 5 files × 5 MB each = 25 MB max — raise Server Action body size limit.
  // Default is 1 MB which is far too small for file attachments.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
