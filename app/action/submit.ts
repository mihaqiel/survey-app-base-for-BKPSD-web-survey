"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitResponse(formData: FormData) {
  const surveyId = formData.get("surveyId") as string;

  // 1. 🛡️ STABLE SERVER-SIDE VALIDATION
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true }
  });

  const now = new Date();
  const deadline = survey?.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline;

  // Preserve the plural path fix to prevent 404s
  if (!survey || !survey.isActive || isExpired) {
    return redirect(`/surveys/${surveyId}`); 
  }

  const answersArray: { questionId: string; value: string }[] = [];
  let scoreValues: number[] = [];

  // 2. 🔍 STABLE DATA PROCESSING
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

  // 3. 📈 NEW LIKERT SCORING LOGIC
  const count = scoreValues.length;
  const rawSum = scoreValues.reduce((a, b) => a + b, 0);

  // A: Mean Score (The average rating on your 1.0 - 5.0 scale)
  const meanScore = count > 0 ? (rawSum / count) : 0;

  // B: Index Score (The normalized 0 - 100% percentage)
  // Formula: ((Mean - Min) / (Max - Min)) * 100
  const indexScore = count > 0 ? ((meanScore - 1) / (5 - 1)) * 100 : 0;

  // 4. 💾 ATOMIC SAVE (Using existing fields to avoid disruption)
  await prisma.response.create({
    data: {
      surveyId,
      // Mapping: globalScore now acts as your Index %, primaryScore as your Mean (1-5)
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