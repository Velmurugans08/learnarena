import { Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../backend.d";
import NavBar from "../components/NavBar";
import { useActor } from "../hooks/useActor";
import { getUserId } from "../lib/auth";

const FILTERS = [
  { label: "All", value: null },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "AI", value: "ai" },
];

const RANK_COLORS = ["#ffaa00", "#aaaaaa", "#cd7f32"];
const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { actor } = useActor();
  const userId = getUserId();
  const [filter, setFilter] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getLeaderboard(filter)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, filter]);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <Trophy
            size={36}
            style={{ color: "#ffaa00", margin: "0 auto 8px" }}
          />
          <h1
            className="text-4xl font-black mb-2"
            style={{
              color: "#ffaa00",
              textShadow: "0 0 20px rgba(255,170,0,0.5)",
            }}
          >
            Leaderboard
          </h1>
          <p className="text-gray-400">Top warriors of LearnArena</p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-2 p-1 rounded-xl mb-6 overflow-x-auto"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {FILTERS.map((f) => (
            <button
              type="button"
              key={String(f.value)}
              data-ocid="leaderboard.filter_tab"
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
              style={{
                background:
                  filter === f.value
                    ? "linear-gradient(135deg, #ffaa00, #ff6b35)"
                    : "transparent",
                color: filter === f.value ? "#0a0a0f" : "#888",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          data-ocid="leaderboard.table"
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {loading ? (
            <div
              data-ocid="leaderboard.loading_state"
              className="text-center py-16 text-gray-400"
            >
              Loading leaderboard...
            </div>
          ) : entries.length === 0 ? (
            <div
              data-ocid="leaderboard.empty_state"
              className="text-center py-16 text-gray-500"
            >
              No entries yet. Be the first!
            </div>
          ) : (
            <div>
              {/* Header */}
              <div
                className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest text-gray-500"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="col-span-1">#</div>
                <div className="col-span-6">Player</div>
                <div className="col-span-3 text-right">XP</div>
                <div className="col-span-2 text-right">Level</div>
              </div>
              {entries.slice(0, 50).map((entry, i) => {
                const isMe = entry.userId === userId;
                const rankColor = RANK_COLORS[i] || "#555";
                const rankIcon = RANK_ICONS[i];
                return (
                  <div
                    key={entry.userId}
                    data-ocid={`leaderboard.row.${i + 1}`}
                    className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isMe
                        ? "rgba(0,255,136,0.05)"
                        : i % 2 === 0
                          ? "transparent"
                          : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div className="col-span-1">
                      {i < 3 ? (
                        <span className="text-lg">{rankIcon}</span>
                      ) : (
                        <span
                          style={{
                            color: rankColor,
                            fontWeight: "bold",
                            fontSize: 14,
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                        style={{
                          background:
                            i < 3
                              ? `linear-gradient(135deg, ${rankColor}, ${rankColor}88)`
                              : "rgba(255,255,255,0.1)",
                          color: i < 3 ? "#0a0a0f" : "#ccc",
                        }}
                      >
                        {entry.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="font-bold text-sm"
                        style={{
                          color: isMe ? "#00ff88" : i < 3 ? rankColor : "#ccc",
                        }}
                      >
                        {entry.username}
                        {isMe && " (You)"}
                      </span>
                    </div>
                    <div
                      className="col-span-3 text-right font-black"
                      style={{ color: i < 3 ? rankColor : "#888" }}
                    >
                      {Number(entry.xp).toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right text-xs text-gray-500">
                      Lv.{Math.floor(Number(entry.xp) / 100) + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
