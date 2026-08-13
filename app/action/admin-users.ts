"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";

/**
 * Admin account management.
 *
 * Permissions are flat — every active admin can add and revoke others. The
 * guards below exist because that flatness makes self-lockout easy: without
 * them, one careless click could leave the dashboard with no way back in.
 */

export interface AdminUserRow {
  id: string;
  email: string;
  nama: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  createdBy: string | null;
  isSelf: boolean;
  hasPassword: boolean;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const me = await assertAdmin();

  const rows = await prisma.adminUser.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    nama: r.nama,
    isActive: r.isActive,
    lastLoginAt: r.lastLoginAt,
    createdAt: r.createdAt,
    createdBy: r.createdBy,
    isSelf: r.email === me.email,
    hasPassword: r.passwordHash !== null,
  }));
}

export async function addAdminUser(
  email: string,
  nama: string,
): Promise<{ ok: true } | { error: string }> {
  const me = await assertAdmin();

  const normalized = email.trim().toLowerCase();
  const displayName = nama.trim();

  if (!normalized || !displayName) {
    return { error: "Email dan nama wajib diisi." };
  }
  // Deliberately permissive: the real gate is Google's own verification at
  // sign-in, so this only catches obvious typos.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: "Format email tidak valid." };
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: normalized },
    select: { id: true, isActive: true },
  });

  if (existing) {
    if (existing.isActive) return { error: "Email ini sudah terdaftar." };
    // Re-granting access to a revoked account is a reactivation, not a duplicate.
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { isActive: true, nama: displayName },
    });
  } else {
    await prisma.adminUser.create({
      data: { email: normalized, nama: displayName, createdBy: me.email },
    });
  }

  await prisma.logActivity.create({
    data: {
      action: "CREATE",
      target: `Admin: ${normalized}`,
      details: `${me.email} memberikan akses dashboard kepada ${normalized} (${displayName}).`,
    },
  });

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function setAdminActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { error: string }> {
  const me = await assertAdmin();

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { email: true, nama: true, isActive: true },
  });
  if (!target) return { error: "Akun tidak ditemukan." };

  if (target.email === me.email && !isActive) {
    return { error: "Tidak bisa menonaktifkan akun Anda sendiri." };
  }

  // Never let the last active account be switched off — that locks everyone out.
  if (!isActive) {
    const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
    if (activeCount <= 1) {
      return { error: "Ini satu-satunya admin aktif. Tambahkan admin lain terlebih dahulu." };
    }
  }

  await prisma.adminUser.update({ where: { id }, data: { isActive } });

  await prisma.logActivity.create({
    data: {
      action: isActive ? "UNBLOCK" : "BLOCK",
      target: `Admin: ${target.email}`,
      details: `${me.email} ${isActive ? "mengaktifkan kembali" : "mencabut"} akses dashboard ${target.email}.`,
    },
  });

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function removeAdminUser(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const me = await assertAdmin();

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { email: true, passwordHash: true },
  });
  if (!target) return { error: "Akun tidak ditemukan." };

  if (target.email === me.email) {
    return { error: "Tidak bisa menghapus akun Anda sendiri." };
  }
  if (target.passwordHash !== null) {
    return { error: "Akun break-glass tidak bisa dihapus. Nonaktifkan saja bila perlu." };
  }

  const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
  if (activeCount <= 1) {
    return { error: "Ini satu-satunya admin aktif. Tambahkan admin lain terlebih dahulu." };
  }

  await prisma.adminUser.delete({ where: { id } });

  await prisma.logActivity.create({
    data: {
      action: "DELETE",
      target: `Admin: ${target.email}`,
      details: `${me.email} menghapus akun admin ${target.email}.`,
    },
  });

  revalidatePath("/admin/pengguna");
  return { ok: true };
}
