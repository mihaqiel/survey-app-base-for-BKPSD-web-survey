// app/api/admin/security/feed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}

/**
 * GET /api/admin/security/feed
 *
 * Returns the 50 most recent non-normal responses for the suspicious activity feed.
 * Includes fingerprint hash (truncated to 8 chars), service name, and quality metadata.
 */
export async function GET(): Promise<NextResponse> {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const feed = await prisma.respon.findMany({
    where: { responStatus: { not: "normal" } },
    select: {
      id:             true,
      responStatus:   true,
      weight:         true,
      similarityScore: true,
      fingerprintHash: true,
      createdAt:      true,
      layanan:        { select: { nama: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    feed.map(r => ({
      id:             r.id,
      responStatus:   r.responStatus,
      weight:         r.weight,
      similarityScore: r.similarityScore,
      fingerprintHash: r.fingerprintHash ? r.fingerprintHash.slice(0, 8) + "…" : null,
      fingerprintFull: r.fingerprintHash,
      layananNama:    r.layanan.nama,
      createdAt:      r.createdAt.toISOString(),
    }))
  );
}
