import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const WORLDS = [
  {
    id: "python",
    name: "Python Forest",
    icon: "🌲",
    description: "Solve Python challenges in a magical forest",
    color: "#00ff88",
    bg: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,100,60,0.1))",
    border: "rgba(0,255,136,0.3)",
    sublevel: "Deep Forest Temple",
    ocid: "worldmap.python_card",
  },
  {
    id: "java",
    name: "Java Ocean",
    icon: "🌊",
    description: "Conquer Java on ocean islands",
    color: "#00d4ff",
    bg: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,80,120,0.1))",
    border: "rgba(0,212,255,0.3)",
    sublevel: "Next Island",
    ocid: "worldmap.java_card",
  },
  {
    id: "c",
    name: "C City",
    icon: "🏙️",
    description: "Navigate C programming in a cyber city",
    color: "#9b59ff",
    bg: "linear-gradient(135deg, rgba(155,89,255,0.15), rgba(80,40,120,0.1))",
    border: "rgba(155,89,255,0.3)",
    sublevel: "New District",
    ocid: "worldmap.c_card",
  },
  {
    id: "ai",
    name: "AI Island",
    icon: "🏝️",
    description: "Explore AI concepts on a futuristic island",
    color: "#ff6b35",
    bg: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(120,60,20,0.1))",
    border: "rgba(255,107,53,0.3)",
    sublevel: "Advanced AI Lab",
    ocid: "worldmap.ai_card",
  },
];

export default function WorldMap() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-black mb-2"
            style={{
              color: "#00ff88",
              textShadow: "0 0 20px rgba(0,255,136,0.5)",
            }}
          >
            World Map
          </h1>
          <p className="text-gray-400">
            Choose your programming world and begin your quest
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORLDS.map((world, i) => (
            <button
              type="button"
              key={world.id}
              data-ocid={world.ocid}
              className="rounded-2xl p-6 text-left w-full cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fadeinup"
              style={{
                background: world.bg,
                border: `1px solid ${world.border}`,
                boxShadow: `0 0 30px ${world.color}15`,
                animationDelay: `${i * 0.1}s`,
                animationFillMode: "both",
              }}
              onClick={() => navigate(`/world/${world.id}`)}
            >
              <div className="flex items-start gap-4">
                <div
                  className="text-5xl flex-shrink-0 animate-float"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    filter: `drop-shadow(0 0 15px ${world.color})`,
                  }}
                >
                  {world.icon}
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-black mb-1"
                    style={{ color: world.color }}
                  >
                    {world.name}
                  </h2>
                  <p className="text-gray-400 text-sm mb-3">
                    {world.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: `${world.color}20`,
                        color: world.color,
                        border: `1px solid ${world.color}40`,
                      }}
                    >
                      Unlocked
                    </span>
                    <span className="text-xs text-gray-500">
                      → {world.sublevel}
                    </span>
                  </div>
                </div>
                <div
                  className="text-sm font-bold px-4 py-2 rounded-lg flex-shrink-0"
                  style={{
                    background: `${world.color}20`,
                    color: world.color,
                    border: `1px solid ${world.color}40`,
                  }}
                >
                  Enter →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
