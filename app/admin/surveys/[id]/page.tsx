import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AnalysisClient } from "./AnalysisClient"; // ✅ Use named import

export default async function SurveyAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: true,
      responses: {
        include: { answers: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!survey) return notFound();

  return <AnalysisClient survey={survey} surveyId={id} />;
}