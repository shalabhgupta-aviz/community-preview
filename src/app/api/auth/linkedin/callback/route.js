// app/api/linkedin/callback/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const saved = req.cookies.get("OIDC_STATE")?.value;

  if (!code || !state || state !== saved) {
    return NextResponse.redirect(`/login?error=csrf_mismatch`);
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

  // 2) Exchange code for access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "authorization_code",
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) {
    return NextResponse.redirect(`/login?error=token_exchange`);
  }

  // 3) Fetch profile
  const profileRes = await fetch(
    "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const profile = await profileRes.json();

  // 4) Fetch email
  const emailRes = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const emailData = await emailRes.json();
  const email = emailData.elements?.[0]["handle~"]?.emailAddress;
  if (!email) {
    return NextResponse.redirect(`/login?error=no_email`);
  }

  // 5) Mint your own JWT
  const token = jwt.sign(
    {
      sub:    profile.id,
      name:   `${profile.localizedFirstName} ${profile.localizedLastName}`,
      email,
      avatar: profile
        .profilePicture?.["displayImage~"]?.elements?.[0]
        ?.identifiers?.[0]?.identifier,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  // 6) Set cookie + redirect
  const res = NextResponse.redirect("/profile");
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30,
  });
  return res;
}