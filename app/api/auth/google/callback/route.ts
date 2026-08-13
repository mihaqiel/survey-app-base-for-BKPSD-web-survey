import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME, MAX_AGE } from "@/lib/session";

/**
 * Decide whether this Google account may access the dashboard.
 *
 * Normally this is a lookup against AdminUser. The env-var branch only runs
 * when no admin exists yet, so a fresh deployment can bootstrap its first
 * account; once any AdminUser row exists that path is closed for good.
 */
async function resolveAdminAccess(email: string): Promise<boolean> {
  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { isActive: true },
  });
  if (existing) return existing.isActive;

  const adminCount = await prisma.adminUser.count();
  if (adminCount > 0) return false;

  const bootstrapList = (process.env.ALLOWED_ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!bootstrapList.includes(email)) return false;

  await prisma.adminUser.create({
    data: { email, nama: email.split("@")[0], createdBy: "bootstrap" },
  });
  console.warn("[google/callback] bootstrap admin created:", email);
  return true;
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // CSRF state check
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || state !== savedState) {
    console.warn("[google/callback] state mismatch — code:%s state:%s savedState:%s",
      !!code, state?.slice(0, 8), savedState?.slice(0, 8));
    return NextResponse.redirect(`${appUrl}/login?error=OAuthState`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[google/callback] config missing — clientId:%s secret:%s",
      !!clientId, !!clientSecret);
    return NextResponse.redirect(`${appUrl}/login?error=ConfigError`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[google/callback] token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=OAuthFailed`);
    }

    const { access_token } = await tokenRes.json();

    // Get user email from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      console.error("[google/callback] userinfo failed:", await userRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=OAuthFailed`);
    }

    const { email, verified_email } = await userRes.json();
    const normalizedEmail = (email as string)?.trim().toLowerCase();

    if (!verified_email || !normalizedEmail) {
      console.warn("[google/callback] unverified email: %s", email);
      return NextResponse.redirect(`${appUrl}/login?error=Unauthorized`);
    }

    // Access is granted by an AdminUser row, not by an env var — so admins can
    // be added or revoked from the dashboard without a redeploy.
    const granted = await resolveAdminAccess(normalizedEmail);
    if (!granted) {
      console.warn("[google/callback] unauthorized email: %s", normalizedEmail);
      return NextResponse.redirect(`${appUrl}/login?error=Unauthorized`);
    }

    await prisma.adminUser.updateMany({
      where: { email: normalizedEmail },
      data: { lastLoginAt: new Date() },
    });

    // Create admin session — same token format as password login
    const sessionToken = await createSessionToken(normalizedEmail);

    // Return a 200 HTML page instead of a 307 redirect.
    // Cookies set on 307 responses during cross-site OAuth chains are NOT reliably
    // included in the browser's follow-up request (cookie present: false in proxy).
    // A 200 response guarantees the browser commits the cookie before the
    // meta-refresh navigation fires.
    const html = `<!DOCTYPE html><html><head>
<meta http-equiv="refresh" content="0;url=/admin">
<title>Redirecting…</title>
</head><body>Redirecting to dashboard…</body></html>`;

    const successRes = new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    successRes.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    console.log("[google/callback] login success: %s", email);
    return successRes;
  } catch (err) {
    console.error("[google/callback] unexpected error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=OAuthFailed`);
  }
}
