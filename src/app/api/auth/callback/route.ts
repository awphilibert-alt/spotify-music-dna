import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const tokens = await getTokens(code);

    const response = NextResponse.redirect(new URL("/", request.url));

    /* Store access token in a cookie (httpOnly for security) */
    response.cookies.set("spotify_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in, // ~1 hour
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Spotify auth error:", message);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, request.url));
  }
}
