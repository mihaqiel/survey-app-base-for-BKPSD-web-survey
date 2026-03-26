// app/api/admin/fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}

/** GET /api/admin/fingerprint — list blacklisted fingerprints */
export async function GET(): Promise<NextResponse> {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.fingerprintBlacklist.findMany({
    orderBy: { blockedAt: "desc" },
  });

  return NextResponse.json(list);
}

/** POST /api/admin/fingerprint — add fingerprint to blacklist */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fingerprintHash, note } = await req.json();

  if (!fingerprintHash || fingerprintHash.length !== 64) {
    return NextResponse.json({ error: "Fingerprint hash tidak valid (harus 64 karakter hex)." }, { status: 400 });
  }

  const record = await prisma.fingerprintBlacklist.upsert({
    where: { fingerprintHash },
    create: { fingerprintHash, reason: "admin", note: note ?? null },
    update: { note: note ?? null, blockedAt: new Date() },
  });

  await prisma.logActivity.create({
    data: {
      action:  "BLOCK",
      target:  `Fingerprint ${fingerprintHash.slice(0, 8)}…`,
      details: `Admin blacklisted fingerprint. Note: ${note ?? "—"}`,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

/** DELETE /api/admin/fingerprint — remove fingerprint from blacklist */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fingerprintHash } = await req.json();

  if (!fingerprintHash) {
    return NextResponse.json({ error: "fingerprintHash diperlukan." }, { status: 400 });
  }

  await prisma.fingerprintBlacklist.deleteMany({ where: { fingerprintHash } });

  await prisma.logActivity.create({
    data: {
      action:  "UNBLOCK",
      target:  `Fingerprint ${fingerprintHash.slice(0, 8)}…`,
      details: "Admin removed fingerprint from blacklist.",
    },
  });

  return NextResponse.json({ ok: true });
}
