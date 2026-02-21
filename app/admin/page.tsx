import { prisma } from "@/lib/prisma"; 
import AdminClient from "./AdminClient";

export default async function AdminDashboard() {
  const surveys = await prisma.survey.findMany({
    include: { 
      responses: {
        orderBy: { createdAt: 'desc' },
        take: 1, 
      },
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const surveysWithTimeStatus = surveys.map(survey => {
    const now = new Date();
    const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
    const isExpired = deadline !== null && now > deadline;
    const isActuallyActive = survey.isActive && !isExpired;

    return {
      ...survey,
      isActuallyActive 
    };
  });

  return <AdminClient surveys={surveysWithTimeStatus} />;
}