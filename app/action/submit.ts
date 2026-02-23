"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true }
  });

  const now = new Date();
  const deadline = survey?.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline;

  // ✅ CHANGED: Redirect to the correct assessment path if survey is inaccessible
  if (!survey || !survey.isActive || isExpired) {
    return redirect(`/assessment/${surveyId}`);
  }

  const answersArray: { questionId: string; value: string }[] = [];
  let scoreValues: number[] = [];

  for (const [key, val] of formData.entries()) {
    if (key.startsWith("answer_")) { 
      const qId = key.replace("answer_", "");
      const question = survey.questions.find(q => q.id === qId);
      const stringValue = String(val);

      answersArray.push({ questionId: qId, value: stringValue });

      if (question?.type === "SCORE") {
        const numScore = Number(stringValue);
        if (!isNaN(numScore)) {
          scoreValues.push(numScore);
        }
      }
    }
  }

  const count = scoreValues.length;
  const rawSum = scoreValues.reduce((a, b) => a + b, 0);
  const meanScore = count > 0 ? (rawSum / count) : 0;
  const indexScore = count > 0 ? ((meanScore - 1) / (5 - 1)) * 100 : 0;

  await prisma.response.create({
    data: {
      surveyId,
      globalScore: indexScore,      
      primaryScore: meanScore,      
      answers: {
        create: answersArray.map(ans => ({
          value: ans.value,
          questionId: ans.questionId,
        })),
      },
    },
  });

  redirect("/success");
}