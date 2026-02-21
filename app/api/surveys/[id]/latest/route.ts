import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const responses = await prisma.response.findMany({
    where: { surveyId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, createdAt: true, globalScore: true } // Minimal data for speed
  });

  return NextResponse.json(responses);
}