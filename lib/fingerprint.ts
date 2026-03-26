/**
 * lib/fingerprint.ts
 * Response Intelligence Engine — fingerprinting, similarity, status/weight assignment.
 *
 * All functions are pure (no I/O) so they can be tested in isolation.
 * The fingerprint is server-side only (IP + User-Agent hash) — no client-side JS required.
 */
import { createHash } from "crypto";

// ─── Hashing ────────────────────────────────────────────────────────────────

/**
 * Build a device fingerprint from server-visible signals.
 * SHA-256(ip || userAgent) — 64-char lowercase hex.
 * Survives IP changes (VPN) if User-Agent stays the same, and vice versa.
 */
export function buildFingerprintHash(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(`${ip}||${userAgent}`)
    .digest("hex");
}

/**
 * Build an answer hash — uniquely identifies a (service, score-pattern) pair.
 * SHA-256("layananId:u1u2u3u4u5u6u7u8u9") — used for exact-duplicate detection.
 */
export function buildAnswerHash(
  layananId: string,
  scores: number[] // [u1, u2, u3, u4, u5, u6, u7, u8, u9]
): string {
  return createHash("sha256")
    .update(`${layananId}:${scores.join("")}`)
    .digest("hex");
}

// ─── Similarity ──────────────────────────────────────────────────────────────

/**
 * Cosine similarity between two 9-dimensional score vectors.
 * Returns 0.0–1.0 (1.0 = identical direction / perfectly matching pattern).
 *
 * Cosine similarity measures angular distance, not absolute difference —
 * so [4,4,4,4,4,4,4,4,4] and [1,1,1,1,1,1,1,1,1] score 1.0 (same direction)
 * but have very different IKM values. This is intentional: we want to detect
 * users who always give the same relative pattern, regardless of absolute value.
 */
export function computeSimilarity(a: number[], b: number[]): number {
  const dot  = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (!magA || !magB) return 0;
  return Math.min(1, dot / (magA * magB)); // clamp to 1.0 for floating-point safety
}

// ─── Status + Weight Assignment ──────────────────────────────────────────────

export type ResponseStatus = "normal" | "suspicious" | "low_quality" | "spam";

export interface QualityResult {
  status: ResponseStatus;
  weight: number;
}

/**
 * Assign a quality status and weight based on similarity to historical responses.
 *
 * Rules (in precedence order):
 * - similarity ≥ 0.99 AND prior submissions ≥ 2 → spam (weight 0)
 * - similarity ≥ 0.99 AND first repeat              → low_quality (weight 0.3)
 * - similarity ≥ 0.80                               → suspicious (weight 0.7)
 * - no history or similarity < 0.80                 → normal (weight 1.0)
 *
 * historicalCount: number of PREVIOUS responses from this fingerprint for
 * the same service (cross-period). Does not include the current submission.
 */
export function assignStatusAndWeight(
  similarityScore: number | null,
  historicalCount: number
): QualityResult {
  if (similarityScore === null) return { status: "normal", weight: 1.0 };
  if (similarityScore >= 0.99 && historicalCount >= 2) return { status: "spam",        weight: 0   };
  if (similarityScore >= 0.99)                         return { status: "low_quality", weight: 0.3 };
  if (similarityScore >= 0.80)                         return { status: "suspicious",  weight: 0.7 };
  return { status: "normal", weight: 1.0 };
}

// ─── Weighted IKM Utility ────────────────────────────────────────────────────

export type TrustMode = "all" | "weighted" | "valid_only";

type ScoredResponse = {
  u1: number; u2: number; u3: number;
  u4: number; u5: number; u6: number;
  u7: number; u8: number; u9: number;
  weight: number;
  responStatus: string;
};

/**
 * Calculate IKM from a set of responses using the weighted formula.
 *
 * trustMode:
 *   "all"        — treat every response as weight 1.0 (raw count, matches pre-enhancement formula)
 *   "weighted"   — use each response's weight field (default, recommended)
 *   "valid_only" — only include responses where responStatus === "normal", then weight 1.0
 *
 * Returns 0 when there are no effective responses.
 */
export function calcWeightedIkm(
  responses: ScoredResponse[],
  trustMode: TrustMode = "weighted"
): number {
  let filtered = responses;

  if (trustMode === "valid_only") {
    filtered = responses.filter(r => r.responStatus === "normal");
  }

  if (filtered.length === 0) return 0;

  if (trustMode === "all") {
    // Unweighted formula — backward-compatible with pre-enhancement calculation
    const total = filtered.reduce(
      (s, r) => s + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0
    );
    return parseFloat(((total / (9 * filtered.length)) * 25).toFixed(2));
  }

  // Weighted formula: SUM(w × score) / (SUM(w) × 9) × 25
  let weightedScore = 0;
  let weightSum = 0;
  for (const r of filtered) {
    const w = r.weight ?? 1.0; // treat null (legacy rows) as 1.0
    weightedScore += w * (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9);
    weightSum += w;
  }

  if (weightSum === 0) return 0;
  return parseFloat(((weightedScore / (9 * weightSum)) * 25).toFixed(2));
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ResponseStatus, string> = {
  normal:      "Valid",
  suspicious:  "Mencurigakan",
  low_quality: "Kualitas Rendah",
  spam:        "Spam",
};

export const STATUS_COLORS: Record<ResponseStatus, { bg: string; text: string; border: string }> = {
  normal:      { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  suspicious:  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  low_quality: { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5" },
  spam:        { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
};
