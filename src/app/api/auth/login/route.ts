import { NextResponse } from "next/server";
import { getAuthURL } from "@/lib/spotify";

export function GET() {
  return NextResponse.redirect(getAuthURL());
}
