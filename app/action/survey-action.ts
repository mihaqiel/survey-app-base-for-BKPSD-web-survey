"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createFullSurvey(formData: FormData, questionList: { text: string; type: string }[]) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  // 1. Validate the owner from your .env
  const ownerId = process.env.OWNER_ID;

  // 2. The Database Transaction
  // This creates the Survey AND the Questions in one single operation
  const newSurvey = await prisma.survey.create({
    data: {
      title,
      description,
      ownerId: ownerId || "unauthorized_admin",
      questions: {
        create: questionList.map((q) => ({
          text: q.text,
          type: q.type,
        })),
      },
    },
  });

  // 3. Redirect to the newly created survey view
  redirect(`/surveys/${newSurvey.id}`);
}