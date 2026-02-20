"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;

  // 1. 🛡️ SERVER-SIDE RE-VALIDATION
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true }
  });

  const now = new Date();
  const deadline = survey?.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline;

  // ✅ REDIRECT FIX: Plural path '/surveys/' prevents 404
  if (!survey || !survey.isActive || isExpired) {
    return redirect(`/surveys/${surveyId}`); 
  }

  const answersArray: { questionId: string; value: string }[] = [];
  let scoreValues: number[] = [];

  // 2. PROCESS FORM DATA
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("answer_")) { 
      const qId = key.replace("answer_", "");
      const question = survey.questions.find(q => q.id === qId);
      const stringValue = String(val);

      // Schema uses 'value' field
      answersArray.push({ questionId: qId, value: stringValue });

      if (question?.type === "SCORE") {
        const numScore = Number(stringValue);
        if (!isNaN(numScore)) scoreValues.push(numScore);
      }
    }
  }

  // 3. ✅ INDIVIDUAL TOTAL SUM
  // Calculates total sum for this specific response, not an average
  const totalScoreSum = scoreValues.length > 0 
    ? scoreValues.reduce((a, b) => a + b, 0) 
    : 0;

  // 4. ATOMIC SAVE
  await prisma.response.create({
    data: {
      surveyId,
      globalScore: totalScoreSum, // Saves individual total sum
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