import { cookies } from "next/headers";
import { getMusicDNA } from "@/lib/spotify";
import { userData as mockData } from "./data";
import { Dashboard } from "./dashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_token")?.value;

  let data = null;
  let isConnected = false;

  if (token) {
    try {
      data = await getMusicDNA(token);
      isConnected = true;
    } catch {
      /* Token expired or invalid — show mock data */
    }
  }

  return <Dashboard data={data} mockData={mockData} isConnected={isConnected} />;
}
