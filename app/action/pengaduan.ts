"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { pengaduanConfirmTemplate, pengaduanNotifTemplate } from "@/lib/email-templates";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function submitPengaduan(
  _prev: unknown,
  formData: FormData,
): Promise<{ success?: true; error?: string }> {
  const nama = (formData.get("nama") as string)?.trim().slice(0, 100);
  const email = (formData.get("email") as string)?.trim().slice(0, 200);
  const telepon = (formData.get("telepon") as string)?.trim().slice(0, 30) || null;
  const judul = (formData.get("judul") as string)?.trim().slice(0, 200);
  const isi = (formData.get("isi") as string)?.trim().slice(0, 2000);
  const file = formData.get("gambar") as File | null;

  // Validate required fields
  if (!nama || !email || !judul || !isi) {
    return { error: "Nama, email, judul, dan isi pengaduan wajib diisi." };
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }

  // Handle optional image
  let gambar: Uint8Array<ArrayBuffer> | null = null;
  let gambarType: string | null = null;
  let gambarName: string | null = null;

  if (file && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: "Ukuran file tidak boleh lebih dari 5 MB." };
    }
    const arrayBuffer = await file.arrayBuffer();
    gambar = new Uint8Array(arrayBuffer as ArrayBuffer);
    gambarType = file.type;
    gambarName = file.name.slice(0, 255);
  }

  try {
    await prisma.pengaduan.create({
      data: { nama, email, telepon, judul, isi, gambar, gambarType, gambarName },
    });

    // Fire-and-forget emails — never block or throw
    void Promise.all([
      sendEmail({
        to: email,
        ...pengaduanConfirmTemplate({ nama, judul }),
      }),
      process.env.ADMIN_EMAIL
        ? sendEmail({
            to: process.env.ADMIN_EMAIL,
            ...pengaduanNotifTemplate({ nama, email, telepon: telepon ?? undefined, judul, isi }),
          })
        : Promise.resolve(),
    ]).catch((err) => console.error("[pengaduan] email error:", err));

    return { success: true };
  } catch (err) {
    console.error("[pengaduan] db error:", err);
    return { error: "Gagal menyimpan pengaduan. Silakan coba lagi." };
  }
}
