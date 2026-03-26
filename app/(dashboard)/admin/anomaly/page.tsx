export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAnomalyStats } from "@/app/action/anomaly";
import AnomalyClient from "./AnomalyClient";

export const metadata: Metadata = {
  title: "Anomali Monitoring — Admin BKPSDM Anambas",
  description: "Analisis pola anomali, fingerprint berulang, dan kualitas data survei.",
};

export default async function AnomalyPage() {
  const stats = await getAnomalyStats();

  if ("error" in stats) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <p className="text-sm text-red-600 font-medium">{stats.error}</p>
      </div>
    );
  }

  return <AnomalyClient stats={stats} />;
}
