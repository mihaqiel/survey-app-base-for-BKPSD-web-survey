// app/action/moderation.ts
"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/app/action/auth";

export type ResponseStatus = "normal" | "suspicious" | "low_quality" | "spam";

const VALID_STATUSES: ResponseStatus[] = ["normal", "suspicious", "low_quality", "spam"];
const VALID_WEIGHTS: number[] = [0, 0.3, 0.7, 1.0];

/**
 * Admin override — manually set quality status and weight on a response.
 * Creates an audit log entry with the admin note.
 */
export async function overrideResponseQuality(
  responId:  string,
  newStatus: ResponseStatus,
  newWeight: number,
  adminNote: string,
): Promise<{ success: boolean; error?: string }> {
  // Auth guard
  if (!(await isAdmin())) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  // Validate inputs
  if (!responId) return { success: false, error: "ID respons tidak valid." };
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: `Status tidak valid: ${newStatus}` };
  }
  if (!VALID_WEIGHTS.includes(newWeight)) {
    return { success: false, error: `Bobot tidak valid: ${newWeight}` };
  }
  if (!adminNote?.trim()) {
    return { success: false, error: "Catatan admin wajib diisi." };
  }

  // Verify the response exists
  const existing = await prisma.respon.findUnique({
    where: { id: responId },
    select: { id: true, responStatus: true, weight: true, layananId: true },
  });
  if (!existing) {
    return { success: false, error: "Respons tidak ditemukan." };
  }

  // Apply override
  await prisma.respon.update({
    where: { id: responId },
    data: { responStatus: newStatus, weight: newWeight },
  });

  // Audit log
  await prisma.logActivity.create({
    data: {
      action:  "UPDATE",
      target:  `Respon ${responId}`,
      details: `Admin override: ${existing.responStatus}→${newStatus}, bobot ${existing.weight}→${newWeight}. Catatan: ${adminNote.trim()}`,
    },
  });

  return { success: true };
}

/**
 * Admin — add a device fingerprint to the blacklist.
 * All future submissions from this fingerprint will be blocked at /blocked?reason=fingerprint.
 */
export async function blacklistFingerprint(
  fingerprintHash: string,
  note?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  if (!fingerprintHash || fingerprintHash.length !== 64) {
    return { success: false, error: "Fingerprint hash tidak valid." };
  }

  await prisma.fingerprintBlacklist.upsert({
    where: { fingerprintHash },
    create: { fingerprintHash, reason: "admin", note: note ?? null },
    update: { note: note ?? null, blockedAt: new Date() },
  });

  await prisma.logActivity.create({
    data: {
      action:  "BLOCK",
      target:  `Fingerprint ${fingerprintHash.slice(0, 8)}…`,
      details: `Admin blacklisted fingerprint. Note: ${note ?? "—"}`,
    },
  });

  return { success: true };
}

/**
 * Admin — remove a fingerprint from the blacklist.
 */
export async function unblacklistFingerprint(
  fingerprintHash: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  await prisma.fingerprintBlacklist.deleteMany({ where: { fingerprintHash } });

  await prisma.logActivity.create({
    data: {
      action:  "UNBLOCK",
      target:  `Fingerprint ${fingerprintHash.slice(0, 8)}…`,
      details: "Admin removed fingerprint from blacklist.",
    },
  });

  return { success: true };
}
