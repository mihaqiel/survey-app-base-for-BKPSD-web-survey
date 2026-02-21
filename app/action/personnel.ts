"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// ✅ 1. PUBLIC FETCHER: Fetches data for the fill page without Admin Auth blocks
export async function getPublicSurvey(id: string) {
  try {
    return await prisma.survey.findUnique({
      where: { id },
      // We only expose questions. We strictly DO NOT expose other people's responses to the public.
      include: { questions: true } 
    });
  } catch (error) {
    console.error("Failed to fetch public survey:", error);
    return null;
  }
}

// ✅ 2. SECURE SUBMISSION LOGIC
export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;

  // 🛡️ SERVER-SIDE GATEKEEPER
  // Re-fetch survey status on submission to prevent bypass of expired/inactive surveys
  const survey = await prisma.survey.findUnique({ 
    where: { id: surveyId }, 
    include: { questions: true } 
  });

  const now = new Date();
  const deadline = survey?.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline; 

  // 🎯 REDIRECT FIX: Send them back to the public fill route so they see the "Assessment Expired" UI
  if (!survey || !survey.isActive || isExpired) {
    return redirect(`/fill/${surveyId}`); 
  }

  const answersArray: { questionId: string; value: string }[] = [];
  let scoreValues: number[] = [];

  // 🔍 PROCESS FORM DATA
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("answer_")) {
      const qId = key.replace("answer_", "");
      const question = survey.questions.find(q => q.id === qId);
      const stringValue = String(val);

      answersArray.push({ 
        questionId: qId, 
        value: stringValue 
      });

      if (question?.type === "SCORE") {
        const numScore = Number(stringValue);
        if (!isNaN(numScore)) {
          scoreValues.push(numScore);
        }
      }
    }
  }

  // 📊 INDIVIDUAL TOTAL SUM
  // Calculates the total points for THIS specific submission
  const totalSumScore = scoreValues.length > 0 
    ? scoreValues.reduce((a, b) => a + b, 0) 
    : 0;

  // ATOMIC SAVE
  await prisma.response.create({
    data: {
      surveyId,
      globalScore: totalSumScore, // Saving the cumulative total for regional tracking
      answers: {
        create: answersArray.map(a => ({
          questionId: a.questionId,
          value: a.value 
        }))
      }
    }
  });

  redirect("/success");
}