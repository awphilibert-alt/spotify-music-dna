import { cookies } from "next/headers";
import { getMusicDNA } from "@/lib/spotify";
import { userData as mockData } from "./data";
import { Dashboard } from "./dashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_token")?.value;

  let data = null;
  let isConnected = false;
  let authError: string | null = null;

  if (token) {
    try {
      data = await getMusicDNA(token);
      isConnected = true;
    } catch (err) {
      authError = err instanceof Error ? err.message : "Unknown API error";
    }
  }

  return <Dashboard data={data} mockData={mockData} isConnected={isConnected} authError={authError} />;
}
