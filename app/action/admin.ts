"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server"; 

// 1. CREATE SURVEY
export async function createDynamicSurvey(formData: FormData) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]
  
  if (!userId || userId !== ownerId) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const deadline = formData.get("deadline") as string; 
  const texts = formData.getAll("qText") as string[];
  const types = formData.getAll("qType") as any[];

  let kpiFound = false;

await prisma.survey.create({
    data: {
      title,
      ownerId: userId,
      expiresAt: deadline ? new Date(deadline) : null,
      isActive: true,
      questions: {
        create: texts.map((text, i) => {
          const isScore = types[i] === "SCORE";
          const isKPI = isScore && !kpiFound;
          if (isKPI) kpiFound = true;
          return { text, type: types[i], isKPI };
        }),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// 2. MANUAL TOGGLE ACTION (The "Close Survey" Button Engine)
export async function toggleSurveyStatus(id: string, currentStatus: boolean) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) return;

  await prisma.survey.update({
    where: { id },
    data: { isActive: !currentStatus }, // Flips true to false, or false to true
  });

  // Revalidate both the admin dashboard and the public survey page
  revalidatePath("/admin");
  revalidatePath(`/surveys/${id}`);
}

// 3. DELETE SURVEY
export async function deleteSurvey(surveyId: string) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!surveyId || userId !== ownerId) return;

  try {
    await prisma.survey.delete({
      where: { id: surveyId },
    });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to delete survey:", error);
  }
}

export async function getAllSurveys() {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) return []; 

  try {
    return await prisma.survey.findMany({
      where: { ownerId: userId }, 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        expiresAt: true,
        isActive: true,
        _count: { select: { responses: true } },
        // 🚀 Add this to see scores on dashboard
        responses: {
          select: { primaryScore: true, globalScore: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return [];
  }
}

// 5. UPDATE SURVEY (Improved with status support)
export async function updateSurvey(formData: FormData) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const deadline = formData.get("deadline") as string;
  const qIds = formData.getAll("qId") as string[];
  const qTexts = formData.getAll("qText") as string[];
  
  // Optional: Check if status was toggled in an edit form
  const statusInput = formData.get("isActive");
  const isActive = statusInput === null ? undefined : statusInput === "true";

  await prisma.survey.update({
    where: { id },
    data: {
      title,
      expiresAt: deadline ? new Date(deadline) : null,
      ...(isActive !== undefined && { isActive }),
    },
  });

  await Promise.all(
    qIds.map((qId, index) => 
      prisma.question.update({
        where: { id: qId },
        data: { text: qTexts[index] }
      })
    )
  );

  revalidatePath("/admin");
  revalidatePath(`/surveys/${id}/results`); 
  revalidatePath(`/surveys/${id}`); 
  
  redirect("/admin");
}

export async function getDetailedAnalysis(surveyId: string) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID;

  if (!userId || userId !== ownerId) return null;

  return await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: true,
      responses: {
        include: { answers: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}
