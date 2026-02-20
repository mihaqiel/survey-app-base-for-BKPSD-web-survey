"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server"; 

// ✅ 1. NEW: CLEAR ALL RESPONSES (WIPE DATA)
// This safely clears the "Bad Math" from old test runs
export async function clearAllResponses() {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) throw new Error("Unauthorized");

  try {
    // ⚠️ This deletes the scores but keeps your Surveys and Questions intact.
    await prisma.response.deleteMany({});
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to clear responses:", error);
  }
}

// 2. CREATE SURVEY (STABLE)
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
          const isKPI = isScore && !kpiFound; // First numeric question is marked as KPI
          if (isKPI) kpiFound = true;
          return { text, type: types[i], isKPI };
        }),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// 3. MANUAL TOGGLE ACTION (STABLE)
export async function toggleSurveyStatus(id: string, currentStatus: boolean) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) return;

  await prisma.survey.update({
    where: { id },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin");
  revalidatePath(`/surveys/${id}`);
}

// 4. DELETE SURVEY (STABLE)
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

// 5. GET ALL SURVEYS (UPDATED FOR ONE-SURVEY LOGIC)
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
        // ✅ FIX: Ensures the dashboard only pulls the latest scores
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { primaryScore: true, globalScore: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return [];
  }
}

// 6. UPDATE SURVEY (STABLE)
export async function updateSurvey(formData: FormData) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  if (!userId || userId !== ownerId) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const deadline = formData.get("deadline") as string;
  const qIds = formData.getAll("qId") as string[];
  const qTexts = formData.getAll("qText") as string[];
  
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

// 7. GET DETAILED ANALYSIS (STABLE)
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