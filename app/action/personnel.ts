"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;

  // 1. 🛡️ SERVER-SIDE GATEKEEPER
  // Re-fetch survey status on submission to prevent bypass of expired/inactive surveys
  const survey = await prisma.survey.findUnique({ 
    where: { id: surveyId }, 
    include: { questions: true } 
  });

  const now = new Date();
  const deadline = survey?.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline; // Compare Date objects [cite: 2026-02-18]

  // ✅ REDIRECT LOGIC: Plural path fix to avoid 404
  if (!survey || !survey.isActive || isExpired) {
    return redirect(`/surveys/${surveyId}`); 
  }

  const answersArray: { questionId: string; value: string }[] = [];
  let scoreValues: number[] = [];

  // 2. 🔍 PROCESS FORM DATA
  for (const [key, val] of formData.entries()) {
    // ✅ MATCHING FIX: Check for "answer_" to match your Fill Page
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

  // 3. 📊 INDIVIDUAL TOTAL SUM
  // This calculates the total points for THIS specific submission (e.g., 5 + 4 + 5 = 14)
  const totalSumScore = scoreValues.length > 0 
    ? scoreValues.reduce((a, b) => a + b, 0) 
    : 0;

  // 4. ATOMIC SAVE
  await prisma.response.create({
    data: {
      surveyId,
      globalScore: totalSumScore, // Saving the cumulative total for regional tracking
      answers: {
        create: answersArray.map(a => ({
          questionId: a.questionId,
          value: a.value // Standardized schema field name
        }))
      }
    }
  });

  redirect("/success");
}