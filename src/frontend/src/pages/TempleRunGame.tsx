import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ============================================================
// TYPES
// ============================================================
interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "high" | "low";
  hit: boolean;
}

interface Coin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  r: number;
}

interface McqQuestion {
  q: string;
  options: string[];
  answer: string;
}

interface GameState {
  lives: number;
  score: number;
  coins: number;
  speed: number;
  distance: number;
  isAlive: boolean;
  isComplete: boolean;
  playerY: number;
  playerVY: number;
  isOnGround: boolean;
  isSliding: boolean;
  slideTimer: number;
  playerBob: number;
  obstacles: Obstacle[];
  gameCoins: Coin[];
  particles: Particle[];
  obstacleTimer: number;
  coinTimer: number;
  bgOffset: [number, number, number];
  mcqActive: boolean;
  currentMcq: McqQuestion | null;
  mcqTimer: number;
  pendingObstacleHit: Obstacle | null;
  startTime: number;
}

// ============================================================
// MCQ BANKS
// ============================================================
const MCQ_BANKS: Record<number, McqQuestion[]> = {
  1: [
    {
      q: "What does `len([1,2,3])` return?",
      options: ["2", "3", "4", "[1,2,3]"],
      answer: "3",
    },
    {
      q: "Which keyword starts a Python function?",
      options: ["func", "function", "def", "define"],
      answer: "def",
    },
    {
      q: "What is `type(3.14)` in Python?",
      options: ["int", "float", "double", "number"],
      answer: "float",
    },
    {
      q: "How do you print in Python?",
      options: ["echo()", "console.log()", "print()", "printf()"],
      answer: "print()",
    },
    {
      q: "What does `range(3)` produce?",
      options: ["[1,2,3]", "[0,1,2]", "[0,1,2,3]", "(1,3)"],
      answer: "[0,1,2]",
    },
  ],
  2: [
    {
      q: "Which type stores whole numbers in Java?",
      options: ["int", "float", "String", "bool"],
      answer: "int",
    },
    {
      q: "How do you declare a class in Java?",
      options: ["class", "struct", "object", "type"],
      answer: "class",
    },
    {
      q: "What is `System.out.println` used for?",
      options: ["Read input", "Print to console", "Open file", "Sleep"],
      answer: "Print to console",
    },
    {
      q: "Java is _____ typed",
      options: ["dynamically", "loosely", "statically", "weakly"],
      answer: "statically",
    },
    {
      q: "Extension of Java files?",
      options: [".jav", ".java", ".js", ".j"],
      answer: ".java",
    },
  ],
  3: [
    {
      q: "Which symbol ends a C statement?",
      options: [":", ".", ";", ","],
      answer: ";",
    },
    {
      q: "How do you declare an integer in C?",
      options: ["integer x;", "int x;", "num x;", "var x;"],
      answer: "int x;",
    },
    {
      q: "What does `printf` do in C?",
      options: ["Read input", "Print output", "Allocate memory", "Loop"],
      answer: "Print output",
    },
    {
      q: "C header for input/output?",
      options: [
        "#include <stdlib.h>",
        "#include <string.h>",
        "#include <stdio.h>",
        "#include <math.h>",
      ],
      answer: "#include <stdio.h>",
    },
    {
      q: "What is `&&` in C?",
      options: ["Bitwise AND", "Logical AND", "OR", "XOR"],
      answer: "Logical AND",
    },
  ],
  4: [
    {
      q: "What does ML stand for?",
      options: [
        "Machine Language",
        "Machine Learning",
        "Model Logic",
        "Meta Loop",
      ],
      answer: "Machine Learning",
    },
    {
      q: "Which Python library is used for ML?",
      options: ["numpy", "pandas", "scikit-learn", "flask"],
      answer: "scikit-learn",
    },
    {
      q: "Neural networks are inspired by?",
      options: [
        "Computer chips",
        "The human brain",
        "Electric circuits",
        "Databases",
      ],
      answer: "The human brain",
    },
    {
      q: "What is overfitting?",
      options: [
        "Model too simple",
        "Model too complex for training data",
        "Low accuracy",
        "Missing data",
      ],
      answer: "Model too complex for training data",
    },
    {
      q: "What does AI stand for?",
      options: [
        "Automated Integration",
        "Artificial Intelligence",
        "Advanced Interface",
        "Applied Inference",
      ],
      answer: "Artificial Intelligence",
    },
  ],
};

const LEVEL_CONFIG = [
  {
    name: "Python Forest",
    color: "#00ff88",
    icon: "🌲",
    target: 500,
    bg: "forest",
  },
  {
    name: "Java Ocean",
    color: "#00d4ff",
    icon: "🌊",
    target: 1000,
    bg: "ocean",
  },
  { name: "C City", color: "#9b59ff", icon: "🏙️", target: 1500, bg: "city" },
  {
    name: "AI Island",
    color: "#ff6b35",
    icon: "🏝️",
    target: 2000,
    bg: "island",
  },
];

const PROGRESS_KEY = "learnarena_runner_progress";
const XP_KEY = "learnarena_xp";

function getProgress(): number[] {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}
function markComplete(level: number) {
  const p = getProgress();
  if (!p.includes(level)) p.push(level);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
function addXP(amount: number) {
  const cur = Number.parseInt(localStorage.getItem(XP_KEY) || "0", 10);
  localStorage.setItem(XP_KEY, String(cur + amount));
}
function randomMcq(level: number): McqQuestion {
  const bank = MCQ_BANKS[level] || MCQ_BANKS[1];
  return bank[Math.floor(Math.random() * bank.length)];
}

// ============================================================
// LEVEL SELECT SCREEN
// ============================================================
function LevelSelect() {
  const navigate = useNavigate();
  const progress = getProgress();

  const isUnlocked = (lvl: number) => lvl === 1 || progress.includes(lvl - 1);

  return (
    <div
      data-ocid="runner.level_select.page"
      style={{
        background: "#0a0a0f",
        minHeight: "100vh",
        fontFamily: "'Bricolage Grotesque', sans-serif",
      }}
      className="flex flex-col"
    >
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            data-ocid="runner.back_button"
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.3)",
              color: "#00ff88",
            }}
          >
            ← Back
          </button>
          <div>
            <h1
              className="text-3xl font-black"
              style={{
                color: "#00ff88",
                textShadow: "0 0 20px rgba(0,255,136,0.6)",
              }}
            >
              🏃 Runner Challenge
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Race through coding worlds — answer MCQs to survive!
            </p>
          </div>
        </div>

        {/* Level cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEVEL_CONFIG.map((cfg, i) => {
            const lvl = i + 1;
            const unlocked = isUnlocked(lvl);
            const completed = progress.includes(lvl);
            return (
              <button
                key={lvl}
                data-ocid={`runner.level_card.${lvl}`}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && navigate(`/runner/${lvl}`)}
                className="rounded-2xl p-6 text-left transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                style={{
                  background: unlocked
                    ? `linear-gradient(135deg, ${cfg.color}14, ${cfg.color}08)`
                    : "rgba(255,255,255,0.03)",
                  border: `2px solid ${unlocked ? `${cfg.color}44` : "rgba(255,255,255,0.08)"}`,
                  boxShadow: unlocked ? `0 0 30px ${cfg.color}18` : "none",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{cfg.icon}</span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: completed
                        ? `${cfg.color}22`
                        : unlocked
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.05)",
                      color: completed ? cfg.color : unlocked ? "#888" : "#555",
                      border: `1px solid ${completed ? `${cfg.color}44` : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {completed
                      ? "✓ Complete"
                      : unlocked
                        ? "Unlocked"
                        : "🔒 Locked"}
                  </span>
                </div>
                <div
                  className="font-black text-lg mb-1"
                  style={{ color: unlocked ? cfg.color : "#555" }}
                >
                  Level {lvl}: {cfg.name}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {cfg.target}m
                </div>
                {!unlocked && (
                  <div className="text-xs mt-2" style={{ color: "#555" }}>
                    Complete Level {lvl - 1} to unlock
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            style={{ color: "#00ff88" }}
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CANVAS DRAWING HELPERS
// ============================================================
function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bgType: string,
  color: string,
  bgOffset: [number, number, number],
) {
  const groundY = H * 0.78;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  if (bgType === "forest") {
    skyGrad.addColorStop(0, "#010f07");
    skyGrad.addColorStop(1, "#041a0c");
  } else if (bgType === "ocean") {
    skyGrad.addColorStop(0, "#010814");
    skyGrad.addColorStop(1, "#011428");
  } else if (bgType === "city") {
    skyGrad.addColorStop(0, "#06011a");
    skyGrad.addColorStop(1, "#0e0122");
  } else {
    skyGrad.addColorStop(0, "#1a0800");
    skyGrad.addColorStop(1, "#0a0511");
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY);

  // Ground
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
  groundGrad.addColorStop(0, `${color}33`);
  groundGrad.addColorStop(1, "#060606");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Parallax layers
  if (bgType === "forest") {
    // Far trees
    ctx.fillStyle = "#021a09";
    for (let i = 0; i < 12; i++) {
      const tx = ((i * 150 - bgOffset[0] * 0.3) % (W + 100)) - 50;
      const th = 60 + (i % 3) * 30;
      ctx.fillRect(tx, groundY - th, 30, th);
      // Tree top
      ctx.beginPath();
      ctx.moveTo(tx - 15, groundY - th);
      ctx.lineTo(tx + 15, groundY - th - 40);
      ctx.lineTo(tx + 45, groundY - th);
      ctx.fill();
    }
    // Mid trees
    ctx.fillStyle = "#032e0f";
    for (let i = 0; i < 8; i++) {
      const tx = ((i * 200 - bgOffset[1] * 0.6) % (W + 120)) - 60;
      const th = 90 + (i % 2) * 40;
      ctx.fillRect(tx, groundY - th, 40, th);
      ctx.beginPath();
      ctx.moveTo(tx - 20, groundY - th);
      ctx.lineTo(tx + 20, groundY - th - 55);
      ctx.lineTo(tx + 60, groundY - th);
      ctx.fill();
    }
  } else if (bgType === "ocean") {
    // Waves - far
    ctx.strokeStyle = "#003a5c";
    ctx.lineWidth = 2;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      const wOff = bgOffset[w] * (0.2 + w * 0.15);
      for (let x = -10; x <= W + 10; x += 5) {
        const y = groundY - 30 - w * 25 + Math.sin((x + wOff) * 0.03) * 12;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Horizon glow
    ctx.fillStyle = "rgba(0,100,180,0.15)";
    ctx.fillRect(0, groundY - 60, W, 60);
  } else if (bgType === "city") {
    // Buildings
    const buildingColors = ["#0d0020", "#130030", "#0a001a"];
    for (let i = 0; i < 14; i++) {
      const bx = ((i * 130 - bgOffset[0] * 0.25) % (W + 140)) - 70;
      const bh = 80 + (i % 5) * 40;
      const bw = 50 + (i % 3) * 20;
      ctx.fillStyle = buildingColors[i % 3];
      ctx.fillRect(bx, groundY - bh, bw, bh);
      // Windows
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(155,89,255,0.4)" : "rgba(255,200,0,0.2)";
      for (let wy = 0; wy < Math.floor(bh / 16); wy++) {
        for (let wx = 0; wx < Math.floor(bw / 14); wx++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(bx + 4 + wx * 14, groundY - bh + 4 + wy * 16, 8, 10);
          }
        }
      }
    }
  } else {
    // AI Island - floating platforms
    ctx.fillStyle = "rgba(255,107,53,0.12)";
    for (let i = 0; i < 5; i++) {
      const px = ((i * 250 - bgOffset[1] * 0.4) % (W + 200)) - 100;
      const py = 60 + (i % 3) * 50;
      const pw = 80 + (i % 2) * 60;
      ctx.beginPath();
      ctx.ellipse(px + pw / 2, py, pw / 2, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,107,53,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Stars
    ctx.fillStyle = "rgba(255,200,150,0.5)";
    for (let i = 0; i < 40; i++) {
      const sx = (i * 73 + 17) % W;
      const sy = (i * 37 + 5) % (groundY * 0.8);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }

  // Ground line glow
  ctx.strokeStyle = `${color}66`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  playerY: number,
  groundY: number,
  isSliding: boolean,
  playerBob: number,
  color: string,
) {
  const baseY = groundY;
  const py = baseY - playerY;

  if (isSliding) {
    // Sliding: flat rectangle
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    roundRect(ctx, x - 20, py - 16, 44, 16, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Standing: humanoid rectangle
    const bobOff = Math.sin(playerBob) * 3;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    // Body
    ctx.beginPath();
    roundRect(ctx, x - 12, py - 44 + bobOff, 24, 32, 4);
    ctx.fill();
    // Head
    ctx.beginPath();
    roundRect(ctx, x - 9, py - 60 + bobOff, 18, 18, 9);
    ctx.fill();
    // Legs
    ctx.beginPath();
    roundRect(ctx, x - 10, py - 14 + bobOff, 9, 14, 3);
    ctx.fill();
    ctx.beginPath();
    roundRect(ctx, x + 1, py - 14 + bobOff, 9, 14, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
// GAME COMPONENT
// ============================================================
function GameCanvas({ level }: { level: number }) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const cfg = LEVEL_CONFIG[level - 1];
  const target = cfg.target;

  // React state for overlays only
  const [overlay, setOverlay] = useState<
    "none" | "mcq" | "gameover" | "complete"
  >("none");
  const [mcqQuestion, setMcqQuestion] = useState<McqQuestion | null>(null);
  const [mcqTimeLeft, setMcqTimeLeft] = useState(3);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  const mcqTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mcqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initGameState = useCallback((): GameState => {
    return {
      lives: 3,
      score: 0,
      coins: 0,
      speed: 300,
      distance: 0,
      isAlive: true,
      isComplete: false,
      playerY: 0,
      playerVY: 0,
      isOnGround: true,
      isSliding: false,
      slideTimer: 0,
      playerBob: 0,
      obstacles: [],
      gameCoins: [],
      particles: [],
      obstacleTimer: 0,
      coinTimer: 0,
      bgOffset: [0, 0, 0],
      mcqActive: false,
      currentMcq: null,
      mcqTimer: 3,
      pendingObstacleHit: null,
      startTime: performance.now(),
    };
  }, []);

  const stopMcqTimers = useCallback(() => {
    if (mcqTimerRef.current) clearTimeout(mcqTimerRef.current);
    if (mcqIntervalRef.current) clearInterval(mcqIntervalRef.current);
    mcqTimerRef.current = null;
    mcqIntervalRef.current = null;
  }, []);

  const handleMcqTimeout = useCallback(() => {
    stopMcqTimers();
    const gs = stateRef.current;
    if (!gs) return;
    gs.lives = Math.max(0, gs.lives - 1);
    if (gs.pendingObstacleHit) gs.pendingObstacleHit.hit = true;
    gs.mcqActive = false;
    gs.pendingObstacleHit = null;
    if (gs.lives <= 0) {
      gs.isAlive = false;
      setFinalScore(Math.round(gs.distance));
      setFinalCoins(gs.coins);
      setOverlay("gameover");
    } else {
      setOverlay("none");
    }
  }, [stopMcqTimers]);

  const startMcqTimer = useCallback(() => {
    setMcqTimeLeft(3);
    stopMcqTimers();
    mcqIntervalRef.current = setInterval(() => {
      setMcqTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          stopMcqTimers();
          handleMcqTimeout();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopMcqTimers, handleMcqTimeout]);

  const triggerMcq = useCallback(
    (obstacle: Obstacle) => {
      const gs = stateRef.current;
      if (!gs || gs.mcqActive) return;
      gs.mcqActive = true;
      gs.pendingObstacleHit = obstacle;
      const q = randomMcq(level);
      gs.currentMcq = q;
      setMcqQuestion(q);
      setOverlay("mcq");
      startMcqTimer();
    },
    [level, startMcqTimer],
  );

  const handleMcqAnswer = useCallback(
    (answer: string) => {
      stopMcqTimers();
      const gs = stateRef.current;
      if (!gs) return;
      const correct = gs.currentMcq?.answer === answer;
      if (correct) {
        gs.coins += 50;
        if (gs.pendingObstacleHit) gs.pendingObstacleHit.hit = true;
      } else {
        gs.lives = Math.max(0, gs.lives - 1);
        if (gs.pendingObstacleHit) gs.pendingObstacleHit.hit = true;
      }
      gs.mcqActive = false;
      gs.pendingObstacleHit = null;
      gs.currentMcq = null;
      if (gs.lives <= 0) {
        gs.isAlive = false;
        setFinalScore(Math.round(gs.distance));
        setFinalCoins(gs.coins);
        setOverlay("gameover");
      } else {
        setOverlay("none");
      }
    },
    [stopMcqTimers],
  );

  const jump = useCallback(() => {
    const gs = stateRef.current;
    if (!gs || gs.mcqActive || !gs.isAlive) return;
    if (gs.isOnGround) {
      gs.playerVY = 620;
      gs.isOnGround = false;
      gs.isSliding = false;
    }
  }, []);

  const slide = useCallback(() => {
    const gs = stateRef.current;
    if (!gs || gs.mcqActive || !gs.isAlive) return;
    if (gs.isOnGround) {
      gs.isSliding = true;
      gs.slideTimer = 800;
    }
  }, []);

  const restart = useCallback(() => {
    setOverlay("none");
    setMcqQuestion(null);
    if (canvasRef.current) {
      stateRef.current = initGameState();
    }
  }, [initGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    stateRef.current = initGameState();

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        slide();
      }
    };
    window.addEventListener("keydown", onKey);

    // Touch
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy > 50) slide();
      else jump();
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("click", jump);

    const gameLoop = (timestamp: number) => {
      const dt = Math.min(
        (timestamp - (lastTimeRef.current || timestamp)) / 1000,
        0.05,
      );
      lastTimeRef.current = timestamp;

      const gs = stateRef.current;
      if (!gs || !gs.isAlive || gs.isComplete || gs.mcqActive) {
        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const groundY = H * 0.78;
      const PLAYER_X = 150;
      const GRAVITY = 1400;
      const PLAYER_HEIGHT_STAND = 60;
      const PLAYER_HEIGHT_SLIDE = 16;

      // Update speed & distance
      gs.distance += gs.speed * dt;
      gs.score = Math.round(gs.distance);
      if (gs.distance % 200 < gs.speed * dt * 1.5)
        gs.speed = Math.min(gs.speed + 20, 700);

      // BG parallax
      gs.bgOffset[0] += gs.speed * dt;
      gs.bgOffset[1] += gs.speed * dt * 0.6;
      gs.bgOffset[2] += gs.speed * dt * 0.3;

      // Player bob
      if (gs.isOnGround) gs.playerBob += dt * 10;

      // Gravity & jump
      if (!gs.isOnGround) {
        gs.playerVY -= GRAVITY * dt;
        gs.playerY += gs.playerVY * dt;
        if (gs.playerY <= 0) {
          gs.playerY = 0;
          gs.playerVY = 0;
          gs.isOnGround = true;
        }
      }

      // Slide timer
      if (gs.isSliding) {
        gs.slideTimer -= dt * 1000;
        if (gs.slideTimer <= 0) gs.isSliding = false;
      }

      // Spawn obstacles
      gs.obstacleTimer -= dt * 1000;
      if (gs.obstacleTimer <= 0) {
        const type: "high" | "low" = Math.random() > 0.5 ? "high" : "low";
        const h = type === "high" ? 60 : 30;
        const y = type === "high" ? h : h;
        gs.obstacles.push({ x: W + 30, y, w: 30, h, type, hit: false });
        gs.obstacleTimer = 1200 + Math.random() * 800;
      }
      for (const o of gs.obstacles) {
        o.x -= gs.speed * dt;
      }
      gs.obstacles = gs.obstacles.filter((o) => o.x > -100);

      // Spawn coins
      gs.coinTimer -= dt * 1000;
      if (gs.coinTimer <= 0) {
        for (let i = 0; i < 5; i++) {
          gs.gameCoins.push({
            x: W + 50 + i * 40,
            y: 30 + Math.random() * 60,
            r: 8,
            collected: false,
          });
        }
        gs.coinTimer = 2000 + Math.random() * 1000;
      }
      for (const c of gs.gameCoins) {
        c.x -= gs.speed * dt;
      }
      gs.gameCoins = gs.gameCoins.filter((c) => c.x > -50);

      // Particles
      for (const p of gs.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }
      gs.particles = gs.particles.filter((p) => p.life > 0);

      // Player bounding box
      const pH = gs.isSliding ? PLAYER_HEIGHT_SLIDE : PLAYER_HEIGHT_STAND;
      const shrink = 0.2;
      const px1 = PLAYER_X - 12 + (24 * shrink) / 2;
      const px2 = PLAYER_X + 12 - (24 * shrink) / 2;
      const py1 = groundY - gs.playerY - pH;
      const py2 = groundY - gs.playerY;

      // Check coin collisions
      for (const c of gs.gameCoins) {
        if (c.collected) continue;
        const coinScreenY = groundY - c.y;
        if (
          px2 > c.x - c.r &&
          px1 < c.x + c.r &&
          py2 > coinScreenY - c.r &&
          py1 < coinScreenY + c.r
        ) {
          c.collected = true;
          gs.coins += 1;
          for (let k = 0; k < 8; k++) {
            gs.particles.push({
              x: c.x,
              y: coinScreenY,
              vx: (Math.random() - 0.5) * 200,
              vy: (Math.random() - 0.5) * 200,
              life: 0.4,
              maxLife: 0.4,
              color: cfg.color,
              r: 3,
            });
          }
        }
      }
      gs.gameCoins = gs.gameCoins.filter((c) => !c.collected);

      // Check obstacle collisions
      for (const o of gs.obstacles) {
        if (o.hit) continue;
        const oy1 = groundY - o.y;
        const oy2 = groundY;
        if (px2 > o.x && px1 < o.x + o.w && py2 > oy1 && py1 < oy2) {
          triggerMcq(o);
          break;
        }
      }

      // Check level complete
      if (gs.distance >= target) {
        gs.isComplete = true;
        const elapsed = (performance.now() - gs.startTime) / 1000;
        markComplete(level);
        addXP(200 * level);
        setFinalScore(Math.round(gs.distance));
        setFinalCoins(gs.coins);
        setFinalTime(Math.round(elapsed));
        setOverlay("complete");
      }

      // ---- DRAW ----
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, W, H, cfg.bg, cfg.color, gs.bgOffset);

      // Draw obstacles
      for (const o of gs.obstacles) {
        if (o.hit) continue;
        ctx.fillStyle = "#ff4444";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 10;
        ctx.fillRect(o.x, groundY - o.y, o.w, o.h);
        ctx.shadowBlur = 0;
      }

      // Draw coins
      for (const c of gs.gameCoins) {
        const cy = groundY - c.y;
        ctx.beginPath();
        ctx.arc(c.x, cy, c.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw particles
      for (const p of gs.particles) {
        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color +
          Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.fill();
      }

      // Draw player
      drawPlayer(
        ctx,
        PLAYER_X,
        gs.playerY,
        groundY,
        gs.isSliding,
        gs.playerBob,
        cfg.color,
      );

      // HUD
      ctx.font = "bold 18px 'Bricolage Grotesque', monospace";
      // Lives
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < gs.lives ? "#ff4466" : "#333";
        ctx.shadowColor = i < gs.lives ? "#ff4466" : "transparent";
        ctx.shadowBlur = i < gs.lives ? 8 : 0;
        ctx.fillText("❤", 16 + i * 30, 34);
      }
      ctx.shadowBlur = 0;

      // Distance bar
      const progress = Math.min(gs.distance / target, 1);
      const barW = 200;
      const barX = W / 2 - barW / 2;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      roundRect(ctx, barX, 12, barW, 14, 7);
      ctx.fill();
      ctx.fillStyle = cfg.color;
      ctx.shadowColor = cfg.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      roundRect(ctx, barX, 12, barW * progress, 14, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(gs.distance)}m / ${target}m`, W / 2, 10 + 10);
      ctx.textAlign = "left";

      // Coins
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`🪙 ${gs.coins}`, W - 16, 24);
      ctx.fillStyle = "#888";
      ctx.font = "12px monospace";
      ctx.fillText(`${Math.round(gs.speed)}px/s`, W - 16, 44);
      ctx.textAlign = "left";

      // Level name
      ctx.fillStyle = `${cfg.color}66`;
      ctx.font = "11px monospace";
      ctx.fillText(cfg.name, W / 2 - 40, H - 12);

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", jump);
      stopMcqTimers();
    };
  }, [
    level,
    cfg,
    target,
    initGameState,
    jump,
    slide,
    triggerMcq,
    stopMcqTimers,
  ]);

  const hasNextLevel = level < 4;
  const xpEarned = overlay === "complete" ? 200 * level : finalCoins * 2;

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a0f",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", position: "absolute", inset: 0 }}
        tabIndex={0}
      />

      {/* Back button always visible */}
      <button
        data-ocid="runner.back_button"
        type="button"
        onClick={() => navigate("/runner")}
        style={{
          position: "absolute",
          top: 60,
          left: 12,
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${cfg.color}44`,
          color: cfg.color,
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 12,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        ← Exit
      </button>

      {/* MCQ Overlay */}
      {overlay === "mcq" && mcqQuestion && (
        <div
          data-ocid="runner.mcq.overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#111",
              border: `2px solid ${cfg.color}44`,
              borderRadius: 16,
              padding: 32,
              maxWidth: 520,
              width: "100%",
              boxShadow: `0 0 60px ${cfg.color}22`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={{ color: cfg.color, fontWeight: 900, fontSize: 14 }}>
                ⚠️ OBSTACLE! Answer to clear it
              </span>
              <span
                style={{
                  color: mcqTimeLeft <= 1 ? "#ff4444" : "#ffd700",
                  fontWeight: 900,
                  fontSize: 22,
                }}
              >
                {mcqTimeLeft}s
              </span>
            </div>
            {/* Timer bar */}
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                height: 6,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  background: mcqTimeLeft <= 1 ? "#ff4444" : cfg.color,
                  width: `${(mcqTimeLeft / 3) * 100}%`,
                  transition: "width 0.9s linear",
                }}
              />
            </div>
            <p
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              {mcqQuestion.q}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {mcqQuestion.options.map((opt, i) => (
                <button
                  key={opt}
                  data-ocid={`runner.mcq.option_button.${i + 1}`}
                  type="button"
                  onClick={() => handleMcqAnswer(opt)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${cfg.color}33`,
                    borderRadius: 10,
                    color: "#fff",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      `${cfg.color}22`;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.05)";
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {overlay === "gameover" && (
        <div
          data-ocid="runner.game_over.panel"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              background: "#111",
              border: "2px solid #ff4444",
              borderRadius: 20,
              padding: 40,
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 0 60px rgba(255,68,68,0.3)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>💀</div>
            <h2
              style={{
                color: "#ff4444",
                fontSize: 32,
                fontWeight: 900,
                marginBottom: 4,
              }}
            >
              GAME OVER
            </h2>
            <p style={{ color: "#888", marginBottom: 20 }}>
              You ran out of lives!
            </p>
            <div style={{ color: "#fff", marginBottom: 8 }}>
              Distance:{" "}
              <strong style={{ color: cfg.color }}>{finalScore}m</strong>
            </div>
            <div style={{ color: "#ffd700", marginBottom: 20 }}>
              🪙 {finalCoins} coins → <strong>+{finalCoins * 2} XP</strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                data-ocid="runner.game_over.play_again_button"
                type="button"
                onClick={restart}
                style={{
                  background: cfg.color,
                  color: "#000",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                🔄 Play Again
              </button>
              <button
                data-ocid="runner.game_over.level_select_button"
                type="button"
                onClick={() => navigate("/runner")}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#ccc",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Level Select
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{
                  background: "transparent",
                  color: "#666",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete */}
      {overlay === "complete" && (
        <div
          data-ocid="runner.level_complete.panel"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              background: "#111",
              border: `2px solid ${cfg.color}`,
              borderRadius: 20,
              padding: 40,
              maxWidth: 400,
              width: "100%",
              boxShadow: `0 0 80px ${cfg.color}33`,
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
            <h2
              style={{
                color: cfg.color,
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 4,
                textShadow: `0 0 20px ${cfg.color}88`,
              }}
            >
              LEVEL COMPLETE!
            </h2>
            <p style={{ color: "#888", marginBottom: 20 }}>
              {cfg.name} conquered!
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ color: "#fff" }}>
                <div
                  style={{ fontSize: 20, fontWeight: 900, color: cfg.color }}
                >
                  {finalScore}m
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>Distance</div>
              </div>
              <div style={{ color: "#fff" }}>
                <div
                  style={{ fontSize: 20, fontWeight: 900, color: "#ffd700" }}
                >
                  {finalCoins}
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>Coins</div>
              </div>
              <div style={{ color: "#fff" }}>
                <div
                  style={{ fontSize: 20, fontWeight: 900, color: "#00d4ff" }}
                >
                  {finalTime}s
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>Time</div>
              </div>
            </div>
            <div
              style={{
                background: `${cfg.color}18`,
                border: `1px solid ${cfg.color}44`,
                borderRadius: 10,
                padding: "12px",
                marginBottom: 24,
                color: cfg.color,
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              +{xpEarned} XP Earned!
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hasNextLevel && (
                <button
                  data-ocid="runner.level_complete.next_button"
                  type="button"
                  onClick={() => navigate(`/runner/${level + 1}`)}
                  style={{
                    background: cfg.color,
                    color: "#000",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 24px",
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  Next Level →
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/runner")}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#ccc",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Level Select
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{
                  background: "transparent",
                  color: "#666",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile controls hint */}
      {overlay === "none" && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
            textAlign: "right",
            pointerEvents: "none",
          }}
        >
          SPACE/↑ jump · ↓ slide · tap jump · swipe↓ slide
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN EXPORTED PAGE
// ============================================================
export default function TempleRunGame() {
  const { level } = useParams<{ level?: string }>();
  const levelNum = level ? Number.parseInt(level, 10) : 0;

  if (!level || Number.isNaN(levelNum) || levelNum < 1 || levelNum > 4) {
    return <LevelSelect />;
  }
  return <GameCanvas key={levelNum} level={levelNum} />;
}
