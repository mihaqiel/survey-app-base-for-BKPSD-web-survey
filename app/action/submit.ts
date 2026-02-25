"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 🔍 EMPLOYEE SEARCH (Keep this for the dropdown)
export async function searchPegawai(query: string) {
  if (!query || query.length < 2) return [];
  
  return await prisma.pegawai.findMany({
    where: {
      nama: { contains: query, mode: "insensitive" }
    },
    take: 10,
    select: { id: true, nama: true }
  });
}

// 💾 SUBMIT SURVEY
export async function submitSkmResponse(formData: FormData) {
  // 1. Get the current ACTIVE Global Period
  // (We need this because the form doesn't send periodeId anymore)
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" }
  });

  if (!activePeriod) {
    // If no period is active, we can't save. Redirect to error or home.
    return redirect("/enter?error=no_active_period");
  }

  // 2. Extract & Validate Required Fields
  const layananId = formData.get("layananId") as string;
  const pegawaiId = formData.get("pegawaiId") as string;
  const nama = formData.get("nama") as string;
  const tglLayananStr = formData.get("tglLayanan") as string;

  // ⚠️ CRITICAL VALIDATION: Ensure these are not empty
  if (!layananId || !pegawaiId || !nama || !tglLayananStr) {
    // In a real app, you might want to return an error state to the form
    // For now, we redirect to a failure page or throw logic
    throw new Error("Missing Required Fields: Nama, Tanggal, Layanan, or Pegawai");
  }

  // 3. Handle Optional / Logic Fields
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";

  const getInt = (key: string) => parseInt(formData.get(key) as string) || 0;

  // Job Logic
  let pekerjaan = formData.get("pekerjaan") as string;
  if (pekerjaan === "Lainnya") {
    pekerjaan = (formData.get("pekerjaan_custom") as string) || "Lainnya";
  }

  // Disability Logic
  const isDifabel = formData.get("isDifabel") as string;
  const jenisDisabilitas = isDifabel === "Ya" ? (formData.get("jenisDisabilitas") as string) : null;

  // 4. Save to Database
  await prisma.respon.create({
    data: {
      // ✅ LINKING THE RELATIONS
      periodeId: activePeriod.id, // We found this in step 1
      layananId: layananId,       // From Form
      pegawaiId: pegawaiId,       // From Form
      
      // ✅ NEW DEMOGRAPHICS
      nama: nama,
      tglLayanan: new Date(tglLayananStr),
      usia: getInt("usia"),
      jenisKelamin: formData.get("jenisKelamin") as string,
      pendidikan: formData.get("pendidikan") as string,
      pekerjaan: pekerjaan,
      isDifabel: isDifabel,
      jenisDisabilitas: jenisDisabilitas,

      // ✅ SCORES (Q1-Q9)
      u1: getInt("u1"), 
      u2: getInt("u2"), 
      u3: getInt("u3"),
      u4: getInt("u4"), 
      u5: getInt("u5"), 
      u6: getInt("u6"),
      u7: getInt("u7"), 
      u8: getInt("u8"), 
      u9: getInt("u9"),
      
      saran: formData.get("saran") as string,
      ipAddress: ip,
    },
  });

  // 5. Success
  redirect("/success?status=success");
}