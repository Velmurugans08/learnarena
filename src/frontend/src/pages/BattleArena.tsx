import { Bot, Swords, Timer, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useActor } from "../hooks/useActor";
import { getUserId } from "../lib/auth";

const BATTLE_MODES = [
  {
    id: "1v1",
    label: "1 vs 1",
    desc: "Solo battle against one opponent",
    icon: Swords,
    color: "#ff6b35",
    ocid: "battle.mode_1v1",
  },
  {
    id: "2v2",
    label: "2 vs 2",
    desc: "Team battle: two players per side",
    icon: Users,
    color: "#00d4ff",
    ocid: "battle.mode_2v2",
  },
  {
    id: "ai",
    label: "vs AI",
    desc: "Challenge the AI mentor in a battle",
    icon: Bot,
    color: "#9b59ff",
    ocid: "battle.mode_ai",
  },
];

const BATTLE_QUESTIONS = [
  {
    q: "What does len() return in Python?",
    options: ["Length", "Delete", "Convert", "Loop"],
    correct: 0,
  },
  {
    q: "Which keyword defines a Python function?",
    options: ["func", "def", "function", "define"],
    correct: 1,
  },
  {
    q: "What does JVM stand for?",
    options: [
      "Java Virtual Machine",
      "Java Variable Method",
      "Java Version Manager",
      "None",
    ],
    correct: 0,
  },
  {
    q: "What is a pointer in C?",
    options: ["Array type", "Variable storing address", "Function", "Loop var"],
    correct: 1,
  },
  {
    q: "What is machine learning?",
    options: [
      "Programming robots",
      "Learning from data",
      "DB queries",
      "Web dev",
    ],
    correct: 1,
  },
];

type BattleState = "select" | "fighting" | "done";

export default function BattleArena() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const userId = getUserId()!;
  const [state, setState] = useState<BattleState>("select");
  const [mode, setMode] = useState("");
  const [battleId, setBattleId] = useState("");
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state === "fighting") {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            endBattle();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      // AI scores randomly
      aiRef.current = setInterval(() => {
        setAiScore((s) => s + Math.floor(Math.random() * 20));
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (aiRef.current) clearInterval(aiRef.current);
    };
  }, [state]);

  async function startBattle(m: string) {
    setMode(m);
    if (actor) {
      try {
        const res = await actor.createBattle(userId, m);
        if (res.__kind__ === "ok") setBattleId(res.ok.userId || "battle-1");
      } catch {
        /* ignore */
      }
    }
    setState("fighting");
  }

  function endBattle() {
    setState("done");
    clearInterval(timerRef.current!);
    clearInterval(aiRef.current!);
    const results = {
      playerScore: score,
      aiScore,
      mode,
      totalTime: 60 - timer,
    };
    setTimeout(() => {
      navigate("/battles/results", { state: results });
    }, 800);
  }

  function handleAnswer(idx: number) {
    if (answered) return;
    const q = BATTLE_QUESTIONS[qIdx];
    const isCorrect = idx === q.correct;
    setSelected(idx);
    setAnswered(true);
    if (isCorrect) setScore((s) => s + 100 + timer);

    if (actor && battleId) {
      actor
        .submitBattleAnswer(userId, battleId, String(idx), BigInt(60 - timer))
        .catch(() => {});
    }

    setTimeout(() => {
      setAnswered(false);
      setSelected(null);
      setQIdx((i) => (i + 1) % BATTLE_QUESTIONS.length);
    }, 1000);
  }

  const q = BATTLE_QUESTIONS[qIdx];
  const timerColor =
    timer > 30 ? "#00ff88" : timer > 10 ? "#ffaa00" : "#ff4444";

  if (state === "select") {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h1
              className="text-4xl font-black mb-2"
              style={{
                color: "#ff6b35",
                textShadow: "0 0 20px rgba(255,107,53,0.5)",
              }}
            >
              Battle Arena
            </h1>
            <p className="text-gray-400">Choose your battle mode</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BATTLE_MODES.map((bm) => {
              const Icon = bm.icon;
              return (
                <button
                  type="button"
                  key={bm.id}
                  data-ocid={bm.ocid}
                  onClick={() => startBattle(bm.id)}
                  className="rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${bm.color}44`,
                    boxShadow: `0 0 20px ${bm.color}11`,
                  }}
                >
                  <Icon
                    size={36}
                    style={{ color: bm.color, margin: "0 auto 12px" }}
                  />
                  <h3
                    className="text-lg font-black mb-2"
                    style={{ color: bm.color }}
                  >
                    {bm.label}
                  </h3>
                  <p className="text-sm text-gray-400">{bm.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Battle HUD */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,107,53,0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "#00ff88" }} />
            <span className="font-black text-xl" style={{ color: "#00ff88" }}>
              {score}
            </span>
            <span className="text-xs text-gray-500">Your Score</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} style={{ color: timerColor }} />
            <span className="font-black text-2xl" style={{ color: timerColor }}>
              {timer}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">AI Score</span>
            <span className="font-black text-xl" style={{ color: "#9b59ff" }}>
              {aiScore}
            </span>
            <Bot size={16} style={{ color: "#9b59ff" }} />
          </div>
        </div>

        {/* Question */}
        <div
          className="rounded-2xl p-6 mb-4 animate-scalein"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,107,53,0.25)",
          }}
        >
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
            Question {qIdx + 1}
          </p>
          <h2 className="text-lg font-bold text-white mb-6">{q.q}</h2>
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, i) => {
              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.1)";
              let textColor = "#ccc";
              if (answered) {
                if (i === q.correct) {
                  bg = "rgba(0,255,136,0.15)";
                  border = "rgba(0,255,136,0.5)";
                  textColor = "#00ff88";
                } else if (i === selected) {
                  bg = "rgba(239,68,68,0.15)";
                  border = "rgba(239,68,68,0.4)";
                  textColor = "#ef4444";
                }
              } else if (i === selected) {
                bg = "rgba(255,107,53,0.15)";
                border = "rgba(255,107,53,0.5)";
                textColor = "#ff6b35";
              }
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  data-ocid={`battle.option_${i + 1}`}
                  className="flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.01] disabled:cursor-not-allowed"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    color: textColor,
                  }}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-black"
                    style={{ background: `${border}40` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          data-ocid="battle.submit_button"
          onClick={endBattle}
          className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
          style={{
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          End Battle Early
        </button>
      </div>
    </div>
  );
}
