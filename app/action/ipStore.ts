// lib/ipStore.ts
// Minimal in-memory store — ONLY for admin manual block.
// Duplicate detection now uses the existing `respon` DB table.

export interface SpamEntry {
  firstSeen: number;
  lastSeen:  number;
  blocked:   boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _skmSpamMap: Map<string, SpamEntry> | undefined;
}

export const spamMap: Map<string, SpamEntry> =
  global._skmSpamMap ?? (global._skmSpamMap = new Map());

export function isSpamBlocked(ip: string): boolean {
  return spamMap.get(ip)?.blocked === true;
}

export function blockIp(ip: string): void {
  const e = spamMap.get(ip) ??
    { firstSeen: Date.now(), lastSeen: Date.now(), blocked: false };
  e.blocked = true;
  spamMap.set(ip, e);
}

export function unblockIp(ip: string): void {
  const e = spamMap.get(ip);
  if (e) { e.blocked = false; spamMap.set(ip, e); }
}

export function touchIp(ip: string): void {
  const now = Date.now();
  const e = spamMap.get(ip) ??
    { firstSeen: now, lastSeen: now, blocked: false };
  e.lastSeen = now;
  spamMap.set(ip, e);
}

export function getAllEntries(): Array<{ ip: string } & SpamEntry> {
  return Array.from(spamMap.entries())
    .map(([ip, e]) => ({ ip, ...e }))
    .sort((a, b) => b.lastSeen - a.lastSeen);
}