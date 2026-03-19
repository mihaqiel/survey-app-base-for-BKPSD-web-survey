import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, COOKIE_NAME, MAX_AGE } from "@/lib/session";

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
    return NextResponse.redirect(`${appUrl}/login?error=OAuthState`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!clientId || !clientSecret || !adminEmail) {
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

    if (!verified_email || email !== adminEmail) {
      return NextResponse.redirect(`${appUrl}/login?error=Unauthorized`);
    }

    // Create admin session — same token format as password login
    const sessionToken = await createSessionToken();
    cookieStore.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });

    return NextResponse.redirect(`${appUrl}/admin`);
  } catch (err) {
    console.error("[google/callback] error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=OAuthFailed`);
  }
}
