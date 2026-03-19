import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { unblockApprovedTemplate } from "@/lib/email-templates";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const blockedMap = new Map<string, typeof blockedIps[0]>(blockedIps.map((b: typeof blockedIps[0]) => [b.ip, b]));

  // Get distinct layanan counts per IP
  const layananGroups = await prisma.respon.groupBy({
    by: ["ipAddress", "layananId"],
    _count: { ipAddress: true },
  });
  const layananCountMap: Record<string, Set<string>> = {};
  layananGroups.forEach((g: typeof layananGroups[0]) => {
    if (!g.ipAddress) return;
    if (!layananCountMap[g.ipAddress]) layananCountMap[g.ipAddress] = new Set();
    layananCountMap[g.ipAddress].add(g.layananId);
  });

  // Merge: IPs with responses + blocked IPs without responses
  const allIps = new Set([
    ...dbGroups.map((g: typeof dbGroups[0]) => g.ipAddress).filter(Boolean),
    ...blockedIps.map((b: typeof blockedIps[0]) => b.ip),
  ]);

  const result = Array.from(allIps).map((ip: string | null) => {
    const dbEntry = dbGroups.find((g: typeof dbGroups[0]) => g.ipAddress === ip);
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
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    // Fetch email BEFORE deletion — the record is gone after deleteMany
    const record = await prisma.blockedIp.findUnique({
      where: { ip },
      select: { messageEmail: true },
    });

    await prisma.blockedIp.deleteMany({ where: { ip } });

    // Fire-and-forget confirmation to the user who submitted the unblock request
    if (record?.messageEmail) {
      const approvedAt = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      const { subject, html } = unblockApprovedTemplate({ ip, approvedAt });
      void sendEmail({ to: record.messageEmail, subject, html });
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
