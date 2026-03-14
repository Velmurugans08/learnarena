import { useNavigate } from "react-router-dom";

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 2}px`,
    delay: `${Math.random() * 3}s`,
    dur: `${2 + Math.random() * 2}s`,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.8)",
            animation: `pulse-glow ${s.dur} ${s.delay} infinite ease-in-out`,
          }}
        />
      ))}
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(155,89,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        background:
          "linear-gradient(135deg, #020208 0%, #0a0a1a 50%, #030810 100%)",
      }}
    >
      <StarField />

      <div className="relative z-10 text-center px-8 max-w-xl w-full animate-fadeinup">
        {/* Logo */}
        <div
          className="text-7xl md:text-8xl font-black tracking-tight mb-3"
          style={{
            background: "linear-gradient(135deg, #00ff88, #00d4ff, #9b59ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(0,255,136,0.5))",
          }}
        >
          LearnArena
        </div>

        {/* Tagline */}
        <p
          className="text-xl md:text-2xl font-bold tracking-widest uppercase mb-12"
          style={{
            color: "#00d4ff",
            textShadow: "0 0 15px rgba(0,212,255,0.8)",
          }}
        >
          ⚔️ Battle With Brains ⚔️
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            type="button"
            data-ocid="landing.login_button"
            onClick={() => navigate("/auth")}
            className="px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: "transparent",
              color: "#00ff88",
              border: "2px solid #00ff88",
              boxShadow: "0 0 20px rgba(0,255,136,0.3)",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background =
                "rgba(0,255,136,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            Login
          </button>
          <button
            type="button"
            data-ocid="landing.signup_button"
            onClick={() => navigate("/auth?tab=signup")}
            className="px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00ff88, #00d4ff)",
              color: "#0a0a0f",
              border: "none",
              boxShadow: "0 0 30px rgba(0,255,136,0.5)",
              letterSpacing: "0.15em",
            }}
          >
            Sign Up
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-10 tracking-wider">
          Learn coding through epic game worlds
        </p>
      </div>
    </div>
  );
}
