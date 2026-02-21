import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this import based on your prisma client location

export async function POST(req: Request) {
  try {
    const { title, durationInMinutes, questions } = await req.json();

    // ✅ SURGICAL MATH: Calculate the exact minute of expiration [cite: 2026-02-21]
    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + durationInMinutes * 60000);

    const survey = await prisma.survey.create({
      data: {
        title,
        isActive: true, // Master switch starts as ON
        expiresAt: expiryTime, // Set the "Auto-Pilot" deadline
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            isKPI: q.isKPI || false,
          })),
        },
      },
    });

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Survey Creation Error:", error);
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 });
  }
}