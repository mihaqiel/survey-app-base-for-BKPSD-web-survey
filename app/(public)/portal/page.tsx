import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalForm from "./PortalForm";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("skm_token");
  if (!token) redirect("/enter");
  return <PortalForm />;
}