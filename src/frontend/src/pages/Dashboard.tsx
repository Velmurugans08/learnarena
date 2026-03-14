import {
  Award,
  Map as MapIcon,
  Shield,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../backend.d";
import NavBar from "../components/NavBar";
import { useActor } from "../hooks/useActor";
import { getLevelFromXP, getUserId, getUsername } from "../lib/auth";

const ACHIEVEMENTS = [
  {
    id: "first_win",
    label: "First Win",
    icon: "🏆",
    desc: "Win your first battle",
  },
  {
    id: "python_master",
    label: "Python Master",
    icon: "🌲",
    desc: "Complete Python Forest",
  },
  {
    id: "java_master",
    label: "Java Master",
    icon: "🌊",
    desc: "Complete Java Ocean",
  },
  { id: "c_master", label: "C Master", icon: "🏙️", desc: "Complete C City" },
  {
    id: "ai_master",
    label: "AI Master",
    icon: "🏝️",
    desc: "Complete AI Island",
  },
  {
    id: "speed_coder",
    label: "Speed Coder",
    icon: "⚡",
    desc: "Solve a problem in under 30s",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const userId = getUserId()!;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || !userId) return;
    actor
      .getProfile(userId)
      .then((res) => {
        if (res.__kind__ === "ok") setProfile(res.ok);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, userId]);

  const xp = profile ? Number(profile.xp) : 0;
  const level = profile ? Number(profile.level) : getLevelFromXP(BigInt(xp));
  const battleWins = profile ? Number(profile.battleWins) : 0;
  const completedWorlds = profile ? profile.completedWorlds : [];
  const username = profile?.username || getUsername();
  const xpForNextLevel = level * 100;
  const xpProgress = ((xp % 100) / 100) * 100;

  const STATS = [
    {
      label: "XP Points",
      value: xp.toLocaleString(),
      icon: Zap,
      color: "#00ff88",
      ocid: "dashboard.xp_card",
    },
    {
      label: "Level",
      value: level,
      icon: Shield,
      color: "#00d4ff",
      ocid: "dashboard.level_card",
    },
    {
      label: "Battle Wins",
      value: battleWins,
      icon: Swords,
      color: "#9b59ff",
      ocid: "dashboard.wins_card",
    },
    {
      label: "Worlds Done",
      value: completedWorlds.length,
      icon: MapIcon,
      color: "#ff6b35",
      ocid: "dashboard.worlds_card",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero / User profile */}
        <div
          className="rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))",
            border: "1px solid rgba(0,255,136,0.2)",
            boxShadow: "0 0 40px rgba(0,255,136,0.08)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #00ff88, #00d4ff)",
              color: "#0a0a0f",
              boxShadow: "0 0 30px rgba(0,255,136,0.5)",
            }}
          >
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1
              className="text-2xl font-black mb-1"
              style={{
                color: "#00ff88",
                textShadow: "0 0 15px rgba(0,255,136,0.6)",
              }}
            >
              {username}
            </h1>
            <p className="text-gray-400 text-sm mb-3">
              Level {level} Arena Warrior
            </p>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">XP Progress</span>
                <span className="text-xs text-gray-400">
                  {xp} / {xpForNextLevel}
                </span>
              </div>
              <div
                className="h-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${xpProgress}%`,
                    background: "linear-gradient(90deg, #00ff88, #00d4ff)",
                    boxShadow: "0 0 8px rgba(0,255,136,0.6)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                data-ocid={s.ocid}
                className="rounded-xl p-4 text-center transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${s.color}33`,
                  boxShadow: `0 0 20px ${s.color}11`,
                }}
              >
                <Icon
                  size={20}
                  style={{ color: s.color, margin: "0 auto 8px" }}
                />
                <div
                  className="text-2xl font-black mb-1"
                  style={{ color: s.color }}
                >
                  {loading ? "..." : s.value}
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            {
              label: "World Map",
              icon: "🗺️",
              path: "/world-map",
              color: "#00ff88",
            },
            { label: "Battles", icon: "⚔️", path: "/battles", color: "#ff6b35" },
            {
              label: "Leaderboard",
              icon: "🏆",
              path: "/leaderboard",
              color: "#9b59ff",
            },
            {
              label: "AI Mentor",
              icon: "🤖",
              path: "/leaderboard",
              color: "#00d4ff",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => navigate(item.path)}
              className="rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${item.color}33`,
              }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold" style={{ color: item.color }}>
                {item.label}
              </div>
            </button>
          ))}
        </div>

        {/* Runner Game Card */}
        <button
          data-ocid="dashboard.runner_button"
          type="button"
          onClick={() => navigate("/runner")}
          className="w-full rounded-2xl p-5 mb-8 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(155,89,255,0.08))",
            border: "1px solid rgba(255,107,53,0.35)",
            boxShadow: "0 0 30px rgba(255,107,53,0.1)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,107,53,0.3), rgba(155,89,255,0.2))",
              border: "1px solid rgba(255,107,53,0.4)",
            }}
          >
            🏃
          </div>
          <div className="flex-1 text-left">
            <div
              className="font-black text-lg mb-0.5"
              style={{
                color: "#ff6b35",
                textShadow: "0 0 12px rgba(255,107,53,0.5)",
              }}
            >
              Runner Challenge
            </div>
            <div className="text-xs text-gray-400">
              Temple Run-style endless runner through coding worlds — answer
              MCQs to survive!
            </div>
          </div>
          <div
            className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: "rgba(255,107,53,0.2)",
              color: "#ff6b35",
              border: "1px solid rgba(255,107,53,0.3)",
            }}
          >
            PLAY NOW →
          </div>
        </button>

        {/* Achievements */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <Award size={18} style={{ color: "#ff6b35" }} />
            <span style={{ color: "#ff6b35" }}>Achievements</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const earned = profile?.achievements?.includes(ach.id) || false;
              return (
                <div
                  key={ach.id}
                  className="rounded-lg p-3 flex items-center gap-3 transition-all"
                  style={{
                    background: earned
                      ? "rgba(0,255,136,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: earned
                      ? "1px solid rgba(0,255,136,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    opacity: earned ? 1 : 0.5,
                  }}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: earned ? "#00ff88" : "#888" }}
                    >
                      {ach.label}
                    </div>
                    <div className="text-xs text-gray-500">{ach.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
