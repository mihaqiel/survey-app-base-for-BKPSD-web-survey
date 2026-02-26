// app/api/admin/ip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllEntries, blockIp, unblockIp } from "@/app/action/ipStore";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(req: NextRequest): Promise<boolean> {
  // Primary: next/headers cookies
  try {
    const c = await cookies();
    const session = c.get("admin_session");
    const token = c.get("skm_token");
    if (session?.value === "true" || !!token) return true;
  } catch {
    // fall through to fallback
  }

  // Fallback: read raw cookie header from request
  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader.includes("admin_session=true");
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 👇 ADD THESE TWO LINES RIGHT HERE
  const cookieHeader = req.headers.get("cookie") ?? "";
  console.log("🍪 RAW COOKIE HEADER:", cookieHeader);

  if (!await isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... rest of your code unchanged

  const dbGroups = await prisma.respon.groupBy({
    by: ["ipAddress"],
    _count: { ipAddress: true },
    orderBy: { _count: { ipAddress: "desc" } },
  });

  const dbMap: Record<string, number> = {};
  dbGroups.forEach((r) => {
    if (r.ipAddress) dbMap[r.ipAddress] = r._count.ipAddress;
  });

  const memEntries = getAllEntries();
  const allIps = new Set([
    ...memEntries.map((e) => e.ip),
    ...Object.keys(dbMap),
  ]);

  const merged = Array.from(allIps).map((ip) => {
    const mem = memEntries.find((e) => e.ip === ip);
    return {
      ip,
      count:     dbMap[ip] ?? 0,
      firstSeen: mem?.firstSeen ?? Date.now(),
      lastSeen:  mem?.lastSeen  ?? Date.now(),
      blocked:   mem?.blocked   ?? false,
    };
  }).sort((a, b) => b.count - a.count);

  return NextResponse.json(merged);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { ip?: string; action?: string };
    const { ip, action } = body;

    if (!ip || !action) {
      return NextResponse.json({ error: "Missing ip or action" }, { status: 400 });
    }

    if (action === "block") blockIp(ip);
    else if (action === "unblock") unblockIp(ip);
    else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}