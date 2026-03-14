import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useActor } from "../hooks/useActor";
import { hashPassword, setAuth } from "../lib/auth";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login",
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") setTab("signup");
    else if (t === "login") setTab("login");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) {
      setError("Connecting to server...");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const pwHash = await hashPassword(password);
      if (tab === "signup") {
        if (!username.trim()) {
          setError("Username is required");
          setLoading(false);
          return;
        }
        const res = await actor.registerUser(
          username.trim(),
          email.trim(),
          pwHash,
        );
        if (res.__kind__ === "ok") {
          setAuth(res.ok, username.trim());
          navigate("/dashboard");
        } else {
          setError(res.err);
        }
      } else {
        const res = await actor.loginUser(email.trim(), pwHash);
        if (res.__kind__ === "ok") {
          setAuth(res.ok.userId, res.ok.username);
          navigate("/dashboard");
        } else {
          setError(res.err);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#00ff88";
    e.target.style.boxShadow = "0 0 15px rgba(0,255,136,0.2)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #020208 0%, #0a0a1a 50%, #030810 100%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 animate-scalein"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,255,136,0.2)",
          boxShadow: "0 0 40px rgba(0,255,136,0.1)",
        }}
      >
        <div className="text-center mb-6">
          <div
            className="text-3xl font-black"
            style={{
              background: "linear-gradient(135deg, #00ff88, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LearnArena
          </div>
          <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">
            Battle With Brains
          </p>
        </div>

        <div
          className="flex rounded-lg overflow-hidden mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <button
            type="button"
            data-ocid="auth.login_tab"
            onClick={() => setTab("login")}
            className="flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
            style={{
              background:
                tab === "login"
                  ? "linear-gradient(135deg, #00ff88, #00d4ff)"
                  : "transparent",
              color: tab === "login" ? "#0a0a0f" : "#888",
              border: "none",
            }}
          >
            Login
          </button>
          <button
            type="button"
            data-ocid="auth.signup_tab"
            onClick={() => setTab("signup")}
            className="flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
            style={{
              background:
                tab === "signup"
                  ? "linear-gradient(135deg, #00ff88, #00d4ff)"
                  : "transparent",
              color: tab === "signup" ? "#0a0a0f" : "#888",
              border: "none",
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label
                htmlFor="username"
                className="block text-xs text-gray-400 mb-1 uppercase tracking-wider"
              >
                Username
              </label>
              <input
                id="username"
                data-ocid="auth.username_input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-400 mb-1 uppercase tracking-wider"
            >
              Email
            </label>
            <input
              id="email"
              data-ocid="auth.email_input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs text-gray-400 mb-1 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              data-ocid="auth.password_input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm text-red-400"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              {error}
            </div>
          )}

          <button
            data-ocid="auth.submit_button"
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold tracking-wider uppercase rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #00ff88, #00d4ff)",
              color: "#0a0a0f",
              border: "none",
              boxShadow: "0 0 25px rgba(0,255,136,0.4)",
            }}
          >
            {loading
              ? "Processing..."
              : tab === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="hover:text-gray-300 cursor-pointer transition-colors"
            style={{ background: "none", border: "none" }}
          >
            ← Back to Home
          </button>
        </p>
      </div>
    </div>
  );
}
