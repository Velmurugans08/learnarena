import { ChevronRight, Lightbulb, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { McqQuestion } from "../backend.d";
import NavBar from "../components/NavBar";
import { useActor } from "../hooks/useActor";
import { getUserId } from "../lib/auth";

const WORLD_COLORS: Record<string, string> = {
  python: "#00ff88",
  java: "#00d4ff",
  c: "#9b59ff",
  ai: "#ff6b35",
};

const OPTIONS = ["A", "B", "C", "D"] as const;

export default function McqChallenge() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { actor } = useActor();
  const userId = getUserId()!;
  const color = WORLD_COLORS[worldId || "python"] || "#00ff88";

  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; xp: number } | null>(
    null,
  );
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!actor || !worldId) return;
    actor
      .getMcqQuestions(worldId)
      .then((qs) => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, worldId]);

  const q = questions[currentIdx];
  const optionValues = q ? [q.optionA, q.optionB, q.optionC, q.optionD] : [];

  async function handleSubmit() {
    if (!selected || !q || !actor || submitting) return;
    setSubmitting(true);
    try {
      const res = await actor.submitMcqAnswer(userId, q.id, selected);
      if (res.__kind__ === "ok") {
        const xp = Number(res.ok.xpEarned);
        setResult({ correct: res.ok.correct, xp });
        if (res.ok.correct) setTotalXP((prev) => prev + xp);
      }
    } catch {
      /* ignore */
    }
    setAnswered(true);
    setSubmitting(false);
  }

  async function handleHint() {
    if (!q || !actor) return;
    setHintLoading(true);
    try {
      const res = await actor.getAiHint(q.id);
      if (res.__kind__ === "ok") setHint(res.ok);
      else setHint(q.hint || "No hint available.");
    } catch {
      setHint(q.hint || "No hint available.");
    }
    setHintLoading(false);
  }

  function handleNext() {
    setSelected(null);
    setAnswered(false);
    setResult(null);
    setHint("");
    if (currentIdx + 1 >= questions.length) navigate(`/world/${worldId}`);
    else setCurrentIdx((i) => i + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div data-ocid="mcq.loading_state" className="text-gray-400">
            Loading questions...
          </div>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
        <NavBar />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Trophy size={48} style={{ color }} />
          <h2 className="text-2xl font-black" style={{ color }}>
            All Done!
          </h2>
          <p className="text-gray-400">Total XP earned: +{totalXP}</p>
          <button
            type="button"
            onClick={() => navigate(`/world/${worldId}`)}
            className="px-6 py-3 rounded-lg font-bold cursor-pointer"
            style={{ background: color, color: "#0a0a0f" }}
          >
            Back to World
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-400">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-sm font-bold" style={{ color }}>
            +{totalXP} XP
          </span>
        </div>
        <div
          className="h-1 rounded-full mb-8"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentIdx / questions.length) * 100}%`,
              background: color,
            }}
          />
        </div>

        <div
          className="rounded-2xl p-6 mb-6 animate-fadeinup"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${color}33`,
            boxShadow: `0 0 30px ${color}10`,
          }}
        >
          <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">
            {q.question}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {OPTIONS.map((opt, i) => {
              const val = optionValues[i];
              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.1)";
              let textColor = "#ccc";
              if (answered) {
                if (opt === q.correctOption) {
                  bg = "rgba(0,255,136,0.15)";
                  border = "rgba(0,255,136,0.5)";
                  textColor = "#00ff88";
                } else if (opt === selected && opt !== q.correctOption) {
                  bg = "rgba(239,68,68,0.15)";
                  border = "rgba(239,68,68,0.5)";
                  textColor = "#ef4444";
                }
              } else if (opt === selected) {
                bg = `${color}20`;
                border = color;
                textColor = color;
              }
              return (
                <button
                  type="button"
                  key={opt}
                  data-ocid={`mcq.option_${opt.toLowerCase()}`}
                  onClick={() => !answered && setSelected(opt)}
                  disabled={answered}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] disabled:cursor-not-allowed"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    color: textColor,
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: `${border}40`, color: textColor }}
                  >
                    {opt}
                  </span>
                  <span className="text-sm font-medium">{val}</span>
                </button>
              );
            })}
          </div>

          {answered && result && (
            <div
              data-ocid={
                result.correct ? "mcq.success_state" : "mcq.error_state"
              }
              className="mt-4 px-4 py-3 rounded-lg text-sm font-bold text-center"
              style={{
                background: result.correct
                  ? "rgba(0,255,136,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: result.correct ? "#00ff88" : "#ef4444",
                border: `1px solid ${result.correct ? "rgba(0,255,136,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              {result.correct
                ? `✅ Correct! +${result.xp} XP earned`
                : `❌ Wrong! The correct answer was ${q.correctOption}.`}
            </div>
          )}
          {hint && (
            <div
              className="mt-3 px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(155,89,255,0.1)",
                color: "#9b59ff",
                border: "1px solid rgba(155,89,255,0.3)",
              }}
            >
              💡 {hint}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!answered && (
            <>
              <button
                type="button"
                data-ocid="mcq.hint_button"
                onClick={handleHint}
                disabled={hintLoading}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: "rgba(155,89,255,0.1)",
                  color: "#9b59ff",
                  border: "1px solid rgba(155,89,255,0.3)",
                }}
              >
                <Lightbulb size={15} />
                {hintLoading ? "..." : "Hint"}
              </button>
              <button
                type="button"
                data-ocid="mcq.submit_button"
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: color, color: "#0a0a0f", border: "none" }}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            </>
          )}
          {answered && (
            <button
              type="button"
              data-ocid="mcq.next_button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
              style={{ background: color, color: "#0a0a0f" }}
            >
              {currentIdx + 1 >= questions.length
                ? "Complete World"
                : "Next Question"}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
