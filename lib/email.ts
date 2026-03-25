/**
 * Central email utility — uses Nodemailer with Gmail SMTP.
 *
 * Usage:
 *   import { sendEmail } from "@/lib/email";
 *   void sendEmail({ to: "user@example.com", subject: "Hi", html: "<p>Hello</p>" });
 *
 * Requires env vars: GMAIL_USER, GMAIL_APP_PASSWORD
 * Generate an App Password at: myaccount.google.com → Security → App Passwords
 *
 * Errors are caught and logged — never re-thrown — so email failures
 * never crash Server Actions or API Routes.
 */

import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email send");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  console.log(`[email] Sending: "${opts.subject}" → ${opts.to}`);

  try {
    const info = await transporter.sendMail({
      from: `"BKPSDM Anambas" <${user}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    console.log(`[email] Sent OK — messageId: ${info.messageId}`);
  } catch (err) {
    console.error("[email] Failed to send:", {
      to: opts.to,
      subject: opts.subject,
      error: err,
    });
    // Never re-throw — email failures must not break the calling action/route
  }
}
