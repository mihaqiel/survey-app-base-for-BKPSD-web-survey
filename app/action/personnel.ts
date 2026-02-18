"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;
  
  // 1. Extract all dynamic answers from the form
  // We look for any key starting with "ans-"
  const answersData: { questionId: string; content: string }[] = [];
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("ans-")) {
      const questionId = key.replace("ans-", "");
      answersData.push({
        questionId,
        content: value as string,
      });
    }
  }

  // 2. Save the response and all answers in one go
  await prisma.response.create({
    data: {
      surveyId,
      answers: {
        create: answersData.map((ans) => ({
          content: ans.content,
          questionId: ans.questionId,
        })),
      },
    },
  });

  // 3. Send the personnel to a success page
  redirect("/success");
}