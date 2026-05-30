"use client";

import { userData as MockDataType } from "./data";

/* Types for the Spotify API data */
interface SpotifyData {
  user: { name: string; username: string; avatar_url: string };
  top_artists: { name: string; spotify_url: string; image: string }[];
  top_tracks: { title: string; artist: string; album: string; spotify_url: string; duration: string }[];
  top_genres: { name: string; percentage: number }[];
}

interface DashboardProps {
  data: SpotifyData | null;
  mockData: typeof MockDataType;
  isConnected: boolean;
  authError?: string | null;
}

function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ─── Animated equalizer bars ─── */
function Equalizer() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="eq-bar w-[3px] rounded-full bg-accent" />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════ */
export function Dashboard({ data, mockData, isConnected, authError }: DashboardProps) {
  /* Merge: use real data if connected, fall back to mock */
  const user = data?.user ?? mockData.user;
  const topArtists = data?.top_artists ?? mockData.top_artists.map((a) => ({
    name: a.name,
    spotify_url: a.spotify_url,
    image: a.image,
  }));
  const topTracks = data?.top_tracks ?? mockData.top_tracks;
  const topGenres = data?.top_genres ?? mockData.top_genres.map((g) => ({
    name: g.name,
    percentage: g.percentage,
  }));

  const stats = mockData.listening_stats;
  const personality = mockData.personality;
  const hours = Math.round(stats.total_minutes_this_year / 60);

  const genreColors = ["bg-green", "bg-purple-500", "bg-accent", "bg-blue-400", "bg-pink-500", "bg-cream/30"];

  return (
    <div className="mesh-bg min-h-dvh no-scrollbar">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-4 md:gap-5">

        {/* ─── HERO ─── */}
        <div className="glass p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Equalizer />
                <span className="text-cream/30 text-[10px] tracking-[0.3em] uppercase">
                  {isConnected ? "Your real data" : "Demo mode"}
                </span>
              </div>
              <h1 className="font-display text-[clamp(2.8rem,8vw,5rem)] leading-[0.9] text-cream">
                MUSIC<span className="text-accent"> DNA</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="font-display text-xl md:text-2xl tracking-wide">{user.name.toUpperCase()}</p>
              <p className="text-cream/30 text-[10px] tracking-widest">{user.username}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="flex-1">
              <p className="text-accent text-[10px] tracking-[0.3em] uppercase mb-1">Your Archetype</p>
              <p className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[0.9] text-cream">
                THE <span className="text-accent">SONIC EXPLORER</span>
              </p>
              <p className="text-cream/40 text-xs mt-2 max-w-sm leading-relaxed">
                Tu creuses les albums entiers, tu explores les deep cuts à 2 h du mat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {personality.traits.map((trait, i) => (
                <span
                  key={trait}
                  className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase rounded-full border ${
                    i % 2 === 0
                      ? "border-accent/40 text-accent bg-accent/5"
                      : "border-green/40 text-green bg-green/5"
                  }`}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Auth error display */}
          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-xs font-mono">
              ⚠️ Spotify API error: {authError}
            </div>
          )}

          {/* Connect button when not logged in */}
          {!isConnected && (
            <a
              href="/api/auth/login"
              className="flex items-center justify-center gap-3 bg-green text-black font-display text-lg tracking-wide px-6 py-3.5 rounded-full hover:brightness-110 transition-all w-full sm:w-auto sm:self-start"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              CONNECT WITH SPOTIFY
            </a>
          )}
        </div>

        {/* ─── STATS ROW ─── */}
        {!isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: fmt(stats.total_minutes_this_year), label: "Minutes", sub: `≈ ${fmt(hours)}h`, color: "text-accent" },
              { value: String(stats.total_artists), label: "Artistes", sub: "89 nouveaux", color: "text-green" },
              { value: fmt(stats.total_tracks), label: "Titres joués", sub: null, color: "text-cream" },
              { value: String(stats.listening_streak_days), label: "Jours de streak", sub: "🔥 active", color: "text-accent" },
            ].map((s) => (
              <div key={s.label} className="glass p-4 md:p-5 text-center">
                <p className={`font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-none ${s.color}`}>{s.value}</p>
                <p className="text-cream/40 text-[10px] tracking-[0.2em] uppercase mt-2">{s.label}</p>
                {s.sub && <p className="text-cream/20 text-[10px] mt-1">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ─── ARTISTS + TRACKS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Top Artists */}
          <div className="glass p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl md:text-3xl text-cream">TOP ARTISTS</h2>
              <span className="text-cream/20 text-[10px] tracking-[0.2em] uppercase">On repeat</span>
            </div>
            <div className="flex flex-col gap-1">
              {topArtists.map((artist, i) => (
                <a
                  key={artist.name}
                  href={artist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-cream/5 transition-colors"
                >
                  <span className={`font-display text-lg w-7 ${i === 0 ? "text-accent" : "text-cream/20"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    i === 0 ? "bg-accent" : i === 1 ? "bg-green" : "bg-cream/20"
                  }`} />
                  <span className={`font-display flex-1 group-hover:text-accent transition-colors ${
                    i === 0 ? "text-accent text-xl md:text-2xl" : "text-cream text-lg md:text-xl"
                  }`}>
                    {artist.name.toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Top Tracks */}
          <div className="glass p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl md:text-3xl text-cream">TOP TRACKS</h2>
              <span className="text-cream/20 text-[10px] tracking-[0.2em] uppercase">Tap to play</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {topTracks.map((track) => (
                <a
                  key={track.spotify_url}
                  href={track.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-cream/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full border border-cream/15 group-hover:border-accent group-hover:bg-accent/10 flex items-center justify-center transition-all flex-shrink-0">
                    <svg width="10" height="12" viewBox="0 0 10 12" className="fill-cream/30 group-hover:fill-accent transition-colors ml-0.5">
                      <polygon points="0 0 10 6 0 12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base md:text-lg text-cream group-hover:text-accent transition-colors truncate leading-tight">
                      {track.title.toUpperCase()}
                    </p>
                    <p className="text-cream/25 text-[10px] truncate">{track.artist} · {track.album}</p>
                  </div>
                  <span className="text-cream/15 text-[10px] font-mono flex-shrink-0">{track.duration}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── GENRES + PEAK ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Genre DNA */}
          <div className="glass p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl md:text-3xl text-cream">GENRE DNA</h2>
            </div>
            <div className="space-y-3">
              {topGenres.map((genre, i) => (
                <div key={genre.name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cream/60 text-xs tracking-wide uppercase">{genre.name}</span>
                    <span className="font-display text-lg text-accent">{genre.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${genreColors[i] ?? "bg-cream/30"} transition-all group-hover:brightness-125`}
                      style={{ width: `${genre.percentage * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak + CTA */}
          <div className="glass p-5 md:p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-cream/30 text-[10px] tracking-[0.2em] uppercase mb-3">Peak listening</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display text-4xl md:text-5xl text-green italic leading-none">NIGHT</span>
                <span className="text-cream/20 text-[10px] mb-1">22h — 4h</span>
              </div>
              <div className="flex gap-1 items-end h-12">
                {[
                  { label: "Matin", pct: 15, color: "bg-cream/15" },
                  { label: "Après-midi", pct: 20, color: "bg-cream/20" },
                  { label: "Soir", pct: 35, color: "bg-accent/60" },
                  { label: "Nuit", pct: 30, color: "bg-green" },
                ].map((t) => (
                  <div key={t.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-sm ${t.color}`} style={{ height: `${t.pct * 1.2}px` }} />
                    <span className="text-cream/20 text-[8px] tracking-wider uppercase">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-accent text-black font-display text-lg md:text-xl tracking-wide px-6 py-4 rounded-full hover:brightness-110 transition-all"
            >
              <span>GET YOUR MUSIC DNA</span>
              <span className="text-xl">→</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-cream/15 text-[10px] tracking-[0.3em] uppercase">
            Music DNA · Powered by Spotify · 2025
          </p>
        </div>
      </div>
    </div>
  );
}
