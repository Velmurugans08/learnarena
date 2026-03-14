import { Bot, LogOut, Map as MapIcon, Swords, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getAvatarInitials, getUsername } from "../lib/auth";

const NAV_ITEMS = [
  {
    label: "World Map",
    path: "/world-map",
    icon: MapIcon,
    ocid: "nav.worldmap_link",
  },
  {
    label: "Battles",
    path: "/battles",
    icon: Swords,
    ocid: "nav.battles_link",
  },
  {
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
    ocid: "nav.leaderboard_link",
  },
  {
    label: "AI Mentor",
    path: "/dashboard",
    icon: Bot,
    ocid: "nav.mentor_link",
  },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = getUsername();

  function handleLogout() {
    clearAuth();
    navigate("/home");
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,255,136,0.15)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-xl font-black cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #00ff88, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        LearnArena
      </button>

      <div className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              type="button"
              key={item.path}
              data-ocid={item.ocid}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                color: isActive ? "#00ff88" : "#888",
                background: isActive ? "rgba(0,255,136,0.1)" : "transparent",
                textShadow: isActive ? "0 0 10px rgba(0,255,136,0.6)" : "none",
                border: "none",
              }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #00ff88, #00d4ff)",
              color: "#0a0a0f",
            }}
          >
            {getAvatarInitials(username)}
          </div>
          <span className="text-sm text-gray-300 hidden md:block">
            {username}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg cursor-pointer transition-all hover:bg-red-500/10"
          style={{ color: "#666", border: "none" }}
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
