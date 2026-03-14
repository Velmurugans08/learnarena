import { Clock, Target, Trophy, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function BattleResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as {
    playerScore: number;
    aiScore: number;
    mode: string;
    totalTime: number;
  }) || {
    playerScore: 450,
    aiScore: 320,
    mode: "ai",
    totalTime: 45,
  };

  const won = state.playerScore >= state.aiScore;
  const xpEarned = won
    ? Math.floor(state.playerScore / 10) + 50
    : Math.floor(state.playerScore / 15);
  const accuracy =
    state.playerScore > 0
      ? Math.min(
          100,
          Math.floor(
            (state.playerScore / (state.playerScore + state.aiScore)) * 100,
          ),
        )
      : 0;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div
          className="rounded-2xl p-8 text-center animate-scalein"
          style={{
            background: won ? "rgba(0,255,136,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${won ? "rgba(0,255,136,0.3)" : "rgba(239,68,68,0.3)"}`,
            boxShadow: `0 0 50px ${won ? "rgba(0,255,136,0.15)" : "rgba(239,68,68,0.1)"}`,
          }}
        >
          <div className="text-6xl mb-4">{won ? "🏆" : "💔"}</div>
          <h1
            className="text-3xl font-black mb-2"
            style={{
              color: won ? "#00ff88" : "#ef4444",
              textShadow: `0 0 20px ${won ? "rgba(0,255,136,0.8)" : "rgba(239,68,68,0.6)"}`,
            }}
          >
            {won ? "Victory!" : "Defeat"}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {won ? "You dominated the battle!" : "Keep training, warrior!"}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Zap
                size={20}
                style={{ color: "#00ff88", margin: "0 auto 8px" }}
              />
              <div className="text-2xl font-black" style={{ color: "#00ff88" }}>
                {state.playerScore}
              </div>
              <div className="text-xs text-gray-500">Your Score</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Target
                size={20}
                style={{ color: "#9b59ff", margin: "0 auto 8px" }}
              />
              <div className="text-2xl font-black" style={{ color: "#9b59ff" }}>
                {state.aiScore}
              </div>
              <div className="text-xs text-gray-500">Opponent Score</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Trophy
                size={20}
                style={{ color: "#ffaa00", margin: "0 auto 8px" }}
              />
              <div className="text-2xl font-black" style={{ color: "#ffaa00" }}>
                +{xpEarned}
              </div>
              <div className="text-xs text-gray-500">XP Earned</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Clock
                size={20}
                style={{ color: "#00d4ff", margin: "0 auto 8px" }}
              />
              <div className="text-2xl font-black" style={{ color: "#00d4ff" }}>
                {accuracy}%
              </div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/battles")}
              className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ff6b35, #ff4400)",
                color: "#fff",
                border: "none",
                boxShadow: "0 0 20px rgba(255,107,53,0.4)",
              }}
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "#999",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
