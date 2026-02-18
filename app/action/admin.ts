"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server"; // <--- 1. Import Auth

// 1. CREATE SURVEY (Updated with Deadline)
export async function createDynamicSurvey(formData: FormData) {
  // --- SECURITY CHECK START ---
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID;
  
  // If no one is logged in, or the logged-in user isn't the owner
  if (!userId || userId !== ownerId) {
    throw new Error("Unauthorized: Only the owner can create surveys.");
  }
  // --- SECURITY CHECK END ---

  const title = formData.get("title") as string;
  const deadline = formData.get("deadline") as string; 
  
  // We use the ACTUAL logged-in user ID now, not "default-admin"
  const texts = formData.getAll("qText") as string[];
  const types = formData.getAll("qType") as any[];

  const survey = await prisma.survey.create({
    data: {
      title,
      ownerId: userId, // Link to the real user
      expiresAt: deadline ? new Date(deadline) : null,
      questions: {
        create: texts.map((text, i) => ({
          text,
          type: types[i],
        })),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// 2. DELETE SURVEY (Secured)
export async function deleteSurvey(surveyId: string) {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID;

  if (!surveyId || userId !== ownerId) return; // Silent fail if not owner

  try {
    await prisma.survey.delete({
      where: { id: surveyId },
    });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to delete survey:", error);
  }
}

// 3. GET SINGLE SURVEY (Public - No Auth needed for analysis usually, but you can lock it too)
export async function getDetailedAnalysis(surveyId: string) {
  if (!surveyId || surveyId === "undefined") return null;

  return await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: true,
      responses: {
        include: { answers: true }
      }
    }
  });
}

// 4. GET ALL SURVEYS (SECURED - The most important part)
export async function getAllSurveys() {
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID; // [cite: 2026-01-28]

  // Security: If not logged in or not the owner, return empty list
  if (!userId || userId !== ownerId) {
    return []; 
  }

  try {
    const surveys = await prisma.survey.findMany({
      where: { ownerId: userId }, // Only fetch YOUR surveys
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
      },
    });
    return surveys;
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return [];
  }
}

// 5. UPDATE SURVEY (Copy and paste this at the bottom)
export async function updateSurvey(formData: FormData) {
  "use server";
  // 1. Get the current user
  const { userId } = await auth();
  const ownerId = process.env.OWNER_ID;

  // 2. Security Check
  if (!userId || userId !== ownerId) {
    throw new Error("Unauthorized");
  }

  // 3. Get Data from Form
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const deadline = formData.get("deadline") as string;
  
  // Get Question Data
  const qIds = formData.getAll("qId") as string[];
  const qTexts = formData.getAll("qText") as string[];

  // 4. Update Title & Deadline
  await prisma.survey.update({
    where: { id },
    data: {
      title,
      expiresAt: deadline ? new Date(deadline) : null,
    },
  });

  // 5. Update Each Question
  await Promise.all(
    qIds.map((qId, index) => 
      prisma.question.update({
        where: { id: qId },
        data: { text: qTexts[index] }
      })
    )
  );

  // 6. Refresh and Go Back
  revalidatePath("/admin");
  redirect("/admin");
}