import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const c = await cookies();
    if (c.get("admin_session")?.value === "true" || c.get("skm_token")) return true;
  } catch {}
  return req.headers.get("cookie")?.includes("admin_session=true") ?? false;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all IPs from responses
  const dbGroups = await prisma.respon.groupBy({
    by: ["ipAddress"],
    _count: { ipAddress: true },
    orderBy: { _count: { ipAddress: "desc" } },
  });

  // Get all manually blocked IPs from DB
  const blockedIps = await prisma.blockedIp.findMany({
    select: { ip: true, reason: true, blockedAt: true, message: true, messageAt: true, messageEmail: true },
  });
  const blockedMap = new Map(blockedIps.map(b => [b.ip, b]));

  // Get distinct layanan counts per IP
  const layananGroups = await prisma.respon.groupBy({
    by: ["ipAddress", "layananId"],
    _count: { ipAddress: true },
  });
  const layananCountMap: Record<string, Set<string>> = {};
  layananGroups.forEach(g => {
    if (!g.ipAddress) return;
    if (!layananCountMap[g.ipAddress]) layananCountMap[g.ipAddress] = new Set();
    layananCountMap[g.ipAddress].add(g.layananId);
  });

  // Merge: IPs with responses + blocked IPs without responses
  const allIps = new Set([
    ...dbGroups.map(g => g.ipAddress).filter(Boolean),
    ...blockedIps.map(b => b.ip),
  ]);

  const result = Array.from(allIps).map(ip => {
    const dbEntry = dbGroups.find(g => g.ipAddress === ip);
    const blocked = blockedMap.get(ip!);
    return {
      ip: ip!,
      count:        dbEntry?._count.ipAddress ?? 0,
      layananCount: layananCountMap[ip!]?.size ?? 0,
      blocked:      !!blocked,
      blockedAt:    blocked?.blockedAt ?? null,
      reason:       blocked?.reason ?? null,
      hasMessage:   !!blocked?.message,
      message:      blocked?.message ?? null,
      messageAt:    blocked?.messageAt ?? null,
      messageEmail: blocked?.messageEmail ?? null,
    };
  }).sort((a, b) => b.count - a.count);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { ip?: string; action?: string; reason?: string };
  const { ip, action, reason } = body;
  if (!ip || !action) return NextResponse.json({ error: "Missing ip or action" }, { status: 400 });

  if (action === "block") {
    await prisma.blockedIp.upsert({
      where: { ip },
      create: { ip, reason: reason || "manual" },
      update: { reason: reason || "manual", blockedAt: new Date() },
    });
  } else if (action === "unblock") {
    await prisma.blockedIp.deleteMany({ where: { ip } });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}