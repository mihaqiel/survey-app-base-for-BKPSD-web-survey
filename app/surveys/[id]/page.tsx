import { getDetailedAnalysis } from "@/app/action/admin";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyAnalysisPage({ params }: PageProps) {
  // 1. Resolve the promise
  const { id } = await params;

  // 2. Extra safety check
  if (!id || id === "undefined") {
    return notFound();
  }

  // 3. Fetch data
  const data = await getDetailedAnalysis(id);

  if (!data) {
    return notFound();
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">Analysis: {data.title}</h1>
      {/* Table code here */}
    </div>
  );
}