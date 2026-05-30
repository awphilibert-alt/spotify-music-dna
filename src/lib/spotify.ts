const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
const REDIRECT_URI = `${BASE_URL}/api/auth/callback`;

const SCOPES = ["user-read-private", "user-top-read"].join(" ");

/* ── Build the Spotify authorize URL ── */
export function getAuthURL(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/* ── Exchange code for tokens ── */
export async function getTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(`Spotify token error: ${res.status} — ${body.error}: ${body.error_description}`);
  }

  return body;
}

/* ── Fetch from Spotify API ── */
async function spotifyFetch<T>(endpoint: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status} on ${endpoint}`);
  }

  return res.json();
}

/* ── Types for what we need ── */
interface SpotifyArtist {
  name: string;
  external_urls: { spotify: string };
  images: { url: string }[];
  genres: string[];
}

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
}

interface SpotifyUser {
  display_name: string;
  id: string;
  images: { url: string }[];
}

/* ── Fetch user's Music DNA data ── */
export async function getMusicDNA(token: string) {
  const [profile, topArtists, topTracks] = await Promise.all([
    spotifyFetch<SpotifyUser>("/me", token),
    spotifyFetch<{ items: SpotifyArtist[] }>("/me/top/artists?limit=5&time_range=long_term", token),
    spotifyFetch<{ items: SpotifyTrack[] }>("/me/top/tracks?limit=8&time_range=long_term", token),
  ]);

  /* Count genres from top artists */
  const genreCount: Record<string, number> = {};
  for (const artist of topArtists.items) {
    for (const genre of artist.genres) {
      genreCount[genre] = (genreCount[genre] ?? 0) + 1;
    }
  }

  const sortedGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalGenreWeight = sortedGenres.reduce((s, g) => s + g[1], 0);

  return {
    user: {
      name: profile.display_name ?? profile.id,
      username: `@${profile.id}`,
      avatar_url: profile.images[0]?.url ?? "",
    },
    top_artists: topArtists.items.map((a) => ({
      name: a.name,
      spotify_url: a.external_urls.spotify,
      image: a.images[0]?.url ?? "",
    })),
    top_tracks: topTracks.items.map((t) => {
      const totalSec = Math.floor(t.duration_ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      return {
        title: t.name,
        artist: t.artists[0]?.name ?? "",
        album: t.album.name,
        spotify_url: t.external_urls.spotify,
        duration: `${min}:${String(sec).padStart(2, "0")}`,
      };
    }),
    top_genres: sortedGenres.map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalGenreWeight) * 100),
    })),
  };
}
