import type { Metadata } from "next";
import IpClient from "./IpClient";

export const metadata: Metadata = {
  title: "IP Spam Monitor — Admin BKPSDM Anambas",
  description: "Pantau dan kelola aktivitas IP mencurigakan pada sistem survei.",
};

export default function IpPage() {
  return <IpClient />;
}
