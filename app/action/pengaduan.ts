"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { pengaduanConfirmTemplate, pengaduanNotifTemplate } from "@/lib/email-templates";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 5;

export async function submitPengaduan(
  _prev: unknown,
  formData: FormData,
): Promise<{ success?: true; error?: string }> {
  const nama   = (formData.get("nama")   as string)?.trim().slice(0, 100);
  const email  = (formData.get("email")  as string)?.trim().slice(0, 200);
  const telepon = (formData.get("telepon") as string)?.trim().slice(0, 30) || null;
  const judul  = (formData.get("judul")  as string)?.trim().slice(0, 200);
  const isi    = (formData.get("isi")    as string)?.trim().slice(0, 2000);

  if (!nama || !email || !judul || !isi) {
    return { error: "Nama, email, judul, dan isi pengaduan wajib diisi." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }

  // Collect up to 5 attachments (lampiran_0 … lampiran_4)
  const lampiranData: Array<{
    data: Uint8Array<ArrayBuffer>;
    mimeType: string;
    nama: string;
    urutan: number;
  }> = [];

  for (let i = 0; i < MAX_FILES; i++) {
    const file = formData.get(`lampiran_${i}`) as File | null;
    if (!file || file.size === 0) continue;
    if (file.size > MAX_FILE_BYTES) {
      return { error: `File "${file.name}" melebihi batas 5 MB.` };
    }
    const ab = await file.arrayBuffer();
    lampiranData.push({
      data:     new Uint8Array(ab as ArrayBuffer),
      mimeType: file.type || "application/octet-stream",
      nama:     file.name.slice(0, 255),
      urutan:   i,
    });
  }

  const kategori = (formData.get("kategori") as string)?.trim() || null;

  try {
    const record = await prisma.pengaduan.create({
      data: {
        nama, email, telepon, judul, isi, kategori,
        lampiran: { create: lampiranData },
      },
    });

    // Create the DIBUAT activity log entry
    await prisma.pengaduanLog.create({
      data: {
        pengaduanId: record.id,
        aksi: "DIBUAT",
        deskripsi: "Pengaduan diterima dari masyarakat",
        oleh: nama,
      },
    });

    // Schedule emails after response — after() keeps the function alive
    // until the promise resolves, preventing Vercel from freezing it early.
    after(
      Promise.all([
        sendEmail({
          to: email,
          ...pengaduanConfirmTemplate({
            nama,
            judul,
            nomorUrut: record.nomorUrut,
            createdAt: record.createdAt.toISOString(),
          }),
        }),
        process.env.ADMIN_EMAIL
          ? sendEmail({
              to: process.env.ADMIN_EMAIL,
              ...pengaduanNotifTemplate({ nama, email, telepon: telepon ?? undefined, judul, isi }),
            })
          : Promise.resolve(),
      ]).catch((err) => console.error("[pengaduan] email error:", err))
    );

    return { success: true };
  } catch (err) {
    console.error("[pengaduan] db error:", err);
    return { error: "Gagal menyimpan pengaduan. Silakan coba lagi." };
  }
}
