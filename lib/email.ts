/**
 * Central email utility — wraps Resend with graceful degradation.
 *
 * Usage:
 *   import { sendEmail } from "@/lib/email";
 *   void sendEmail({ to: "user@example.com", subject: "Hi", html: "<p>Hello</p>" });
 *
 * If RESEND_API_KEY is not set, a warning is logged and the call is a no-op.
 * Errors from Resend are caught and logged — never re-thrown — so email failures
 * never crash Server Actions or API Routes.
 */

import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set — skipping email send");
    return;
  }

  if (!from) {
    console.warn("[email] FROM_EMAIL is not set — skipping email send");
    return;
  }

  // Lazy initialization: create client at call time so the env var is read
  // at request time rather than at module load / build time.
  const resend = new Resend(apiKey);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[email] Sending: "${opts.subject}" → ${opts.to}`);
  }

  try {
    await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("[email] Failed to send email:", {
      to: opts.to,
      subject: opts.subject,
      error: err instanceof Error ? err.message : String(err),
    });
    // Never re-throw — email failures must not break the calling action/route
  }
}
