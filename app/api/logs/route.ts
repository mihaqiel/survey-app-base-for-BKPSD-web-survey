import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await prisma.logActivity.findMany({
    orderBy: { timestamp: "desc" },
    take: 200,
  });
  return NextResponse.json(logs);
}