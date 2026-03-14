import { ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

const WORLDS: Record<
  string,
  {
    name: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
    description: string;
    subLevels: string[];
  }
> = {
  python: {
    name: "Python Forest",
    icon: "🌲",
    color: "#00ff88",
    bg: "linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,60,30,0.15))",
    border: "rgba(0,255,136,0.2)",
    description: "A magical forest where Python masters are born",
    subLevels: ["Forest Entrance", "Ancient Grove", "Deep Forest Temple"],
  },
  java: {
    name: "Java Ocean",
    icon: "🌊",
    color: "#00d4ff",
    bg: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,60,90,0.15))",
    border: "rgba(0,212,255,0.2)",
    description: "Vast ocean islands filled with Java challenges",
    subLevels: ["Harbor", "First Island", "Next Island"],
  },
  c: {
    name: "C City",
    icon: "🏙️",
    color: "#9b59ff",
    bg: "linear-gradient(135deg, rgba(155,89,255,0.1), rgba(60,30,90,0.15))",
    border: "rgba(155,89,255,0.2)",
    description: "A futuristic cyber city of pointers and memory",
    subLevels: ["City Gate", "Downtown", "New District"],
  },
  ai: {
    name: "AI Island",
    icon: "🏝️",
    color: "#ff6b35",
    bg: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(90,40,10,0.15))",
    border: "rgba(255,107,53,0.2)",
    description: "A futuristic island of AI laboratories",
    subLevels: ["Research Station", "AI Lab", "Advanced AI Lab"],
  },
};

type CardInfo = {
  title: string;
  desc: string;
  extra: string;
  path: string;
  cardColor: string;
  cardBg: string;
  cardBorder: string;
  emoji: string;
  btnLabel: string;
};

export default function WorldPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const world = WORLDS[worldId || "python"];

  if (!world) {
    navigate("/world-map");
    return null;
  }

  const cards: CardInfo[] = [
    {
      title: "MCQ Challenges",
      desc: "Test your knowledge with multiple choice questions",
      extra: "15 Questions",
      path: `/world/${worldId}/mcq`,
      cardColor: world.color,
      cardBg: "rgba(255,255,255,0.04)",
      cardBorder: `${world.color}33`,
      emoji: "📚",
      btnLabel: "Start →",
    },
    {
      title: "Code Debugging",
      desc: "Fix broken code and solve programming challenges",
      extra: "5 Problems",
      path: `/world/${worldId}/code`,
      cardColor: world.color,
      cardBg: "rgba(255,255,255,0.04)",
      cardBorder: `${world.color}33`,
      emoji: "💻",
      btnLabel: "Start →",
    },
    {
      title: "Battle Arena",
      desc: "Compete against other players in real-time",
      extra: "3 Modes",
      path: "/battles",
      cardColor: "#ff6b35",
      cardBg: "rgba(255,255,255,0.04)",
      cardBorder: "rgba(255,107,53,0.3)",
      emoji: "⚔️",
      btnLabel: "Fight →",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div
        className="py-10 px-4 text-center"
        style={{
          background: world.bg,
          borderBottom: `1px solid ${world.border}`,
        }}
      >
        <div
          className="text-6xl mb-3 inline-block animate-float"
          style={{ filter: `drop-shadow(0 0 20px ${world.color})` }}
        >
          {world.icon}
        </div>
        <h1
          className="text-3xl font-black mb-2"
          style={{
            color: world.color,
            textShadow: `0 0 20px ${world.color}80`,
          }}
        >
          {world.name}
        </h1>
        <p className="text-gray-400 text-sm">{world.description}</p>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
          World Progression
        </h2>
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {world.subLevels.map((level, i) => (
            <div key={level} className="flex items-center gap-2 flex-shrink-0">
              <div
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{
                  background:
                    i === 0 ? `${world.color}20` : "rgba(255,255,255,0.05)",
                  color: i === 0 ? world.color : "#555",
                  border: `1px solid ${i === 0 ? `${world.color}40` : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {level}
              </div>
              {i < world.subLevels.length - 1 && (
                <ChevronRight size={16} style={{ color: "#444" }} />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              type="button"
              key={card.title}
              className="rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:scale-105 w-full"
              style={{
                background: card.cardBg,
                border: `1px solid ${card.cardBorder}`,
                boxShadow: `0 0 20px ${card.cardColor}10`,
              }}
              onClick={() => navigate(card.path)}
            >
              <div className="text-3xl mb-3">{card.emoji}</div>
              <h3
                className="text-lg font-black mb-2"
                style={{ color: card.cardColor }}
              >
                {card.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{card.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{card.extra}</span>
                <span
                  className="text-sm px-4 py-2 rounded-lg font-bold"
                  style={{
                    background: `${card.cardColor}20`,
                    color: card.cardColor,
                    border: `1px solid ${card.cardColor}40`,
                  }}
                >
                  {card.btnLabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
