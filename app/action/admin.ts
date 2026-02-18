"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createDynamicSurvey(formData: FormData) {
  const title = formData.get("title") as string;
  const ownerId = process.env.OWNER_ID || "default-admin";

  const texts = formData.getAll("qText") as string[];
  const types = formData.getAll("qType") as any[];

  // Create survey and questions in one transaction
  const survey = await prisma.survey.create({
    data: {
      title,
      ownerId,
      questions: {
        create: texts.map((text, i) => ({
          text,
          type: types[i],
        })),
      },
    },
  });

  redirect("/admin");
}

// Logic for the detailed analysis table we fixed earlier
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