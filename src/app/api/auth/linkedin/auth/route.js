// app/api/linkedin/auth/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(8).toString("hex");
  const base = process.env.NEXTAUTH_URL.replace(/\/$/, '')
  const redirectUri = `${base}/api/linkedin/callback`

  const res = NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?` +
      new URLSearchParams({
        response_type: "code",
        client_id:     process.env.LINKEDIN_CLIENT_ID,
        redirect_uri:  redirectUri,
        state,
        scope:         "r_liteprofile r_emailaddress",
      })
  );
  res.cookies.set("OIDC_STATE", state, { httpOnly: true, sameSite: "lax" });
  return res;
}