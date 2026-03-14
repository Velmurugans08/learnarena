import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const WORLDS = [
  { icon: "🌲", label: "Python Forest", color: "#00ff88" },
  { icon: "🌊", label: "Java Ocean", color: "#00d4ff" },
  { icon: "🏙️", label: "C City", color: "#9b59ff" },
  { icon: "🏝️", label: "AI Island", color: "#ff6b35" },
];

function Particles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${2 + Math.random() * 4}px`,
    drift: `${(Math.random() - 0.5) * 200}px`,
    color: ["#00ff88", "#00d4ff", "#9b59ff", "#ff6b35"][
      Math.floor(Math.random() * 4)
    ],
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: "absolute",
              left: p.left,
              bottom: "-10px",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              animation: `particle ${p.duration} ${p.delay} infinite linear`,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function IntroScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [loadingWidth, setLoadingWidth] = useState(0);
  const loadingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setPhase(1), 300));
    timers.push(setTimeout(() => setPhase(2), 1200));
    timers.push(setTimeout(() => setPhase(3), 2000));
    timers.push(setTimeout(() => setPhase(4), 2800));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase >= 4) {
      let width = 0;
      loadingRef.current = setInterval(() => {
        width += 2;
        setLoadingWidth(width);
        if (width >= 100) {
          clearInterval(loadingRef.current!);
          setPhase(5);
        }
      }, 30);
    }
    return () => {
      if (loadingRef.current) clearInterval(loadingRef.current);
    };
  }, [phase]);

  const worldPositions = [
    { top: "20%", left: "10%" },
    { top: "20%", right: "10%" },
    { bottom: "30%", left: "10%" },
    { bottom: "30%", right: "10%" },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #020208 0%, #0a0a1a 50%, #030810 100%)",
      }}
    >
      <Particles />

      {/* World icons around center */}
      {phase >= 3 &&
        WORLDS.map((w, i) => (
          <div
            key={w.label}
            className="absolute text-center animate-fadeinup"
            style={{
              ...worldPositions[i],
              animationDelay: `${i * 0.15}s`,
              animationFillMode: "both",
            }}
          >
            <div
              className="text-4xl mb-1 animate-float"
              style={{
                animationDelay: `${i * 0.3}s`,
                filter: `drop-shadow(0 0 12px ${w.color})`,
              }}
            >
              {w.icon}
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: w.color, textShadow: `0 0 8px ${w.color}` }}
            >
              {w.label}
            </span>
          </div>
        ))}

      {/* Center content */}
      <div className="relative z-10 text-center px-8 max-w-lg w-full">
        {/* Logo */}
        {phase >= 1 && (
          <div className="animate-scalein mb-4">
            <div
              className="text-6xl md:text-7xl font-black tracking-tight mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #00ff88, #00d4ff, #9b59ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(0,255,136,0.6))",
                animation: "text-glow 2s ease-in-out infinite",
              }}
            >
              LearnArena
            </div>
          </div>
        )}

        {/* Tagline */}
        {phase >= 2 && (
          <div
            className="text-lg md:text-xl font-semibold tracking-widest uppercase mb-8 animate-fadeinup"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 15px rgba(0,212,255,0.8)",
            }}
          >
            ⚔️ Battle With Brains ⚔️
          </div>
        )}

        {/* Loading bar */}
        {phase >= 4 && (
          <div className="animate-fadein mt-8">
            <p className="text-sm text-gray-400 mb-3 tracking-widest uppercase">
              Preparing Battle Arena...
            </p>
            <div
              className="w-full h-2 rounded-full mx-auto"
              style={{ background: "rgba(255,255,255,0.1)", maxWidth: "320px" }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${loadingWidth}%`,
                  background:
                    "linear-gradient(90deg, #00ff88, #00d4ff, #9b59ff)",
                  boxShadow: "0 0 10px rgba(0,255,136,0.8)",
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{loadingWidth}%</p>
          </div>
        )}

        {/* Enter button */}
        {phase >= 5 && (
          <div className="mt-8 animate-scalein">
            <button
              type="button"
              data-ocid="intro.enter_button"
              onClick={() => navigate("/home")}
              className="px-10 py-4 text-sm font-black tracking-widest uppercase rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00d4ff)",
                color: "#0a0a0f",
                boxShadow:
                  "0 0 30px rgba(0,255,136,0.6), 0 0 60px rgba(0,212,255,0.3)",
                border: "none",
                letterSpacing: "0.2em",
              }}
            >
              ENTER LEARNARENA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
