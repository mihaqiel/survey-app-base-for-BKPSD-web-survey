import { prisma } from "@/lib/prisma";
import LandingClient from "./LandingClient";

export default async function LandingPage() {
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" },
    select: { token: true },
  });
  return <LandingClient surveyToken={activePeriod?.token ?? ""} />;
}