import Editor from "@monaco-editor/react";
import { ChevronRight, Lightbulb, Play, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CodingProblem } from "../backend.d";
import NavBar from "../components/NavBar";
import { useActor } from "../hooks/useActor";
import { getUserId } from "../lib/auth";

const WORLD_COLORS: Record<string, string> = {
  python: "#00ff88",
  java: "#00d4ff",
  c: "#9b59ff",
  ai: "#ff6b35",
};
const WORLD_LANGS: Record<string, string> = {
  python: "python",
  java: "java",
  c: "c",
  ai: "python",
};

export default function CodingChallenge() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { actor } = useActor();
  const userId = getUserId()!;
  const color = WORLD_COLORS[worldId || "python"] || "#00ff88";
  const lang = WORLD_LANGS[worldId || "python"] || "python";

  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    passed: boolean;
    message: string;
    xp: number;
  } | null>(null);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    if (!actor || !worldId) return;
    actor
      .getCodingProblems(worldId)
      .then((ps) => {
        setProblems(ps);
        if (ps[0]) setCode(ps[0].brokenCode);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, worldId]);

  const p = problems[currentIdx];

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (p) setCode(p.brokenCode);
    setResult(null);
    setHint("");
    setCanAdvance(false);
  }, [currentIdx, p?.id]);

  async function handleCheck() {
    if (!p || !actor || checking) return;
    setChecking(true);
    try {
      const res = await actor.checkCode(userId, p.id, code);
      if (res.__kind__ === "ok") {
        const xp = Number(res.ok.xpEarned);
        setResult({ passed: res.ok.passed, message: res.ok.message, xp });
        if (res.ok.passed) {
          setTotalXP((prev) => prev + xp);
          setCanAdvance(true);
        }
      }
    } catch {
      /* ignore */
    }
    setChecking(false);
  }

  async function handleHint() {
    if (!p || !actor) return;
    setHintLoading(true);
    try {
      const res = await actor.getAiHint(p.id);
      if (res.__kind__ === "ok") setHint(res.ok);
      else setHint(p.hint || "No hint available.");
    } catch {
      setHint(p.hint || "No hint available.");
    }
    setHintLoading(false);
  }

  function handleNext() {
    if (currentIdx + 1 >= problems.length) {
      navigate(`/world/${worldId}`);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div data-ocid="code.loading_state" className="text-gray-400">
            Loading problems...
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
        <NavBar />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Trophy size={48} style={{ color }} />
          <h2 className="text-2xl font-black" style={{ color }}>
            All Problems Solved!
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            Problem {currentIdx + 1} of {problems.length}
          </span>
          <span className="text-sm font-bold" style={{ color }}>
            +{totalXP} XP
          </span>
        </div>
        <div
          className="h-1 rounded-full mb-6"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentIdx / problems.length) * 100}%`,
              background: color,
            }}
          />
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${color}33`,
          }}
        >
          {/* Problem header */}
          <div
            className="px-6 py-4"
            style={{
              background: `${color}10`,
              borderBottom: `1px solid ${color}22`,
            }}
          >
            <h2 className="text-lg font-black" style={{ color }}>
              {p.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {p.description || "Fix the bug in the code below to advance."}
            </p>
          </div>

          {/* Editor */}
          <div data-ocid="code.editor" style={{ height: "300px" }}>
            <Editor
              height="300px"
              language={lang}
              value={code}
              onChange={(val) => {
                setCode(val || "");
                setResult(null);
                setCanAdvance(false);
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>

          {/* Result feedback */}
          {result && (
            <div
              data-ocid={
                result.passed ? "code.success_state" : "code.error_state"
              }
              className="px-6 py-4 text-sm font-bold"
              style={{
                background: result.passed
                  ? "rgba(0,255,136,0.1)"
                  : "rgba(239,68,68,0.1)",
                color: result.passed ? "#00ff88" : "#ef4444",
                borderTop: `1px solid ${result.passed ? "rgba(0,255,136,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              {result.passed
                ? `✅ ${result.message} +${result.xp} XP`
                : "❌ Code Error Detected. Fix the problem before advancing."}
            </div>
          )}

          {/* Hint */}
          {hint && (
            <div
              className="px-6 py-4 text-sm"
              style={{
                background: "rgba(155,89,255,0.08)",
                color: "#9b59ff",
                borderTop: "1px solid rgba(155,89,255,0.2)",
              }}
            >
              💡 {hint}
            </div>
          )}

          {/* Actions */}
          <div
            className="px-6 py-4 flex gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              data-ocid="code.hint_button"
              onClick={handleHint}
              disabled={hintLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: "rgba(155,89,255,0.1)",
                color: "#9b59ff",
                border: "1px solid rgba(155,89,255,0.3)",
              }}
            >
              <Lightbulb size={14} />
              {hintLoading ? "..." : "Hint"}
            </button>

            {!canAdvance ? (
              <button
                type="button"
                data-ocid="code.check_button"
                onClick={handleCheck}
                disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: color, color: "#0a0a0f", border: "none" }}
              >
                <Play size={14} />
                {checking ? "Checking..." : "Check Code"}
              </button>
            ) : (
              <button
                type="button"
                data-ocid="code.next_button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                style={{ background: color, color: "#0a0a0f" }}
              >
                {currentIdx + 1 >= problems.length
                  ? "Complete"
                  : "Next Problem"}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
