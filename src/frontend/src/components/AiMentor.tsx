import { Bot, Lightbulb, X } from "lucide-react";
import { useState } from "react";

const TIPS = [
  {
    id: "t1",
    text: "Always check if your parentheses, brackets, and quotes are properly closed.",
  },
  {
    id: "t2",
    text: "In Python, indentation is not optional - it defines code blocks!",
  },
  { id: "t3", text: "Read the question carefully before selecting an answer." },
  {
    id: "t4",
    text: "Use the Hint button if you're stuck - it won't affect your score.",
  },
  { id: "t5", text: "In Java, every statement ends with a semicolon (;)." },
  {
    id: "t6",
    text: "In C, use -> to access struct members through a pointer.",
  },
];

export default function AiMentor() {
  const [open, setOpen] = useState(false);
  const tipIdx = 0;
  const tip = TIPS[tipIdx];

  return (
    <>
      <button
        type="button"
        data-ocid="mentor.open_modal_button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #9b59ff, #7b39df)",
          boxShadow: "0 0 25px rgba(155,89,255,0.6)",
          border: "none",
        }}
      >
        <Bot size={24} color="#fff" />
      </button>

      {open && (
        <div
          data-ocid="mentor.panel"
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl animate-scalein"
          style={{
            background: "rgba(15,15,25,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(155,89,255,0.4)",
            boxShadow: "0 0 40px rgba(155,89,255,0.3)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(155,89,255,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <Bot size={18} style={{ color: "#9b59ff" }} />
              <span className="font-black text-sm" style={{ color: "#9b59ff" }}>
                AI Mentor
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(155,89,255,0.2)", color: "#9b59ff" }}
              >
                Active
              </span>
            </div>
            <button
              type="button"
              data-ocid="mentor.close_button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              style={{ color: "#666" }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Tip for you
            </p>
            <div
              className="rounded-xl p-3 flex gap-3"
              style={{
                background: "rgba(155,89,255,0.1)",
                border: "1px solid rgba(155,89,255,0.2)",
              }}
            >
              <Lightbulb
                size={18}
                style={{ color: "#9b59ff", flexShrink: 0, marginTop: 2 }}
              />
              <p className="text-sm text-gray-300 leading-relaxed">
                {tip.text}
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Quick Tips
            </p>
            <div className="space-y-2">
              {TIPS.filter((_, i) => i !== tipIdx)
                .slice(0, 3)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex gap-2 items-start p-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <Lightbulb
                      size={14}
                      style={{ color: "#666", flexShrink: 0, marginTop: 2 }}
                    />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
