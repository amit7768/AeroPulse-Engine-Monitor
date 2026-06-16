"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Activity,
  Bot,
  ChevronDown,
  Loader2,
  Send,
  User,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ClientTime from "@/components/ClientTime";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
  status?: string;
};

const ENGINES = ["ENG-4721-X", "ENG-3310-B", "ENG-0897-C", "ENG-5521-D"];

const SUGGESTED_QUESTIONS = [
  "Explain the RUL prediction for this engine",
  "What does the risk score mean?",
  "Analyze the EGT trend",
  "What maintenance is recommended?",
  "How does the LSTM model work?",
  "Explain the NASA C-MAPSS dataset",
];

// Constructed lazily inside useState initializer so Date() runs only
// on the client, not during server rendering — prevents hydration mismatch.
function makeWelcomeMessage(): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `**Welcome to AeroPulse AI Assistant.** I'm your aerospace engineering intelligence system, connected to real-time telemetry and predictive model outputs.

I can help you understand:
- **RUL predictions** and confidence intervals
- **Sensor anomaly analysis** (EGT, vibration, pressure)
- **Risk scoring methodology** and alert thresholds  
- **Maintenance recommendations** per MSG-3 / IATA ATA Ch.72
- **LSTM model architecture** and training dataset

Select an engine from the dropdown above, then ask me anything about its health status or predictive model outputs.`,
    timestamp: new Date(),
    sources: ["AeroPulse Knowledge Base"],
    confidence: 1.0,
  };
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-glow)]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
      <span className="text-xs font-mono-aerospace text-[var(--text-muted)] ml-1">Analyzing...</span>
    </div>
  );
}

function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const statusColor =
    msg.status === "Critical"
      ? "#ff4444"
      : msg.status === "Warning"
      ? "#ffaa00"
      : msg.status === "Healthy"
      ? "#00ff88"
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? "bg-[rgba(0,102,255,0.2)] border border-[rgba(0,102,255,0.4)]"
            : "bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)]"
        }`}
      >
        {isUser
          ? <User className="w-3.5 h-3.5 text-[var(--blue-accent)]" />
          : <Bot className="w-3.5 h-3.5 text-[var(--cyan-glow)]" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={isUser ? "chat-bubble-user px-4 py-3" : "chat-bubble-ai px-4 py-3"}>
          {isUser ? (
            <p className="text-sm text-white leading-relaxed">{msg.content}</p>
          ) : (
            <div 
              className="text-sm text-[var(--text-primary)] leading-relaxed prose-sm max-w-none
                [&_strong]:text-[var(--cyan-glow)] [&_strong]:font-semibold
                [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1
                [&_p]:mb-2 [&_p:last-child]:mb-0
                [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-base
                [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-sm
                [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-sm
                [&_code]:text-[var(--cyan-dim)] [&_code]:bg-[rgba(0,229,255,0.08)] [&_code]:px-1 [&_code]:rounded
              "
              style={statusColor ? { color: statusColor } : undefined}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className={`flex items-center gap-3 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] font-mono-aerospace text-[var(--text-muted)]">
            <ClientTime date={msg.timestamp} options={{ hour: "2-digit", minute: "2-digit" }} />
          </span>
          {msg.sources && msg.sources.length > 0 && (
            <div className="flex items-center gap-1">
              {msg.sources.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-mono-aerospace text-[var(--cyan-dim)] bg-[rgba(0,229,255,0.06)] px-1.5 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {msg.confidence !== undefined && (
            <span className="text-[10px] font-mono-aerospace text-[var(--text-muted)]">
              {(msg.confidence * 100).toFixed(0)}% conf
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  // useState lazy initializer — runs only on the client, so new Date() is safe.
  const [messages, setMessages] = useState<Message[]>(() => [makeWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [engineId, setEngineId] = useState(ENGINES[0]);
  const [engineDropdown, setEngineDropdown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engineId }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        sources: data.sources,
        confidence: data.confidence,
        status: data.status,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Connection error. Please retry.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-[1000px] mx-auto w-full px-4 pt-20 pb-4 flex flex-col gap-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-[var(--cyan-glow)]" />
              <span className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">
                AEROPULSE AI ASSISTANT
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Engineering Intelligence Chat</h1>
          </div>

          {/* Engine selector */}
          <div className="relative">
            <button
              onClick={() => setEngineDropdown(!engineDropdown)}
              className="panel flex items-center gap-3 px-4 py-2.5 text-sm font-mono-aerospace hover:border-[rgba(0,229,255,0.3)] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full status-ok" />
              <span className="text-[var(--cyan-glow)]">{engineId}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <AnimatePresence>
              {engineDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-1 right-0 panel z-20 min-w-[180px] overflow-hidden"
                >
                  {ENGINES.map((eng) => (
                    <button
                      key={eng}
                      onClick={() => { setEngineId(eng); setEngineDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-mono-aerospace transition-colors hover:bg-[rgba(0,229,255,0.06)] ${
                        eng === engineId ? "text-[var(--cyan-glow)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Chat window */}
        <div className="flex-1 panel overflow-hidden flex flex-col" style={{ minHeight: "calc(100vh - 320px)" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[var(--cyan-glow)]" />
                </div>
                <div className="chat-bubble-ai">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-3">
                SUGGESTED QUERIES
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs font-mono-aerospace px-3 py-1.5 rounded-full border border-[rgba(0,229,255,0.2)] text-[var(--cyan-dim)] bg-[rgba(0,229,255,0.04)] hover:border-[rgba(0,229,255,0.4)] hover:text-[var(--cyan-glow)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-[rgba(0,229,255,0.1)] p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about RUL predictions, sensor anomalies, maintenance recommendations..."
                  rows={1}
                  className="w-full bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.2)] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan-glow)] transition-colors resize-none font-[inherit] leading-relaxed"
                  style={{ minHeight: "46px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-lg border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] flex items-center justify-center text-[var(--cyan-glow)] hover:bg-[rgba(0,229,255,0.15)] hover:border-[var(--cyan-glow)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-[var(--cyan-dim)]" />
                <span className="text-[10px] font-mono-aerospace text-[var(--text-muted)]">
                  AeroPulse-NLP-v1.2 · Context: {engineId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-[var(--success)]" />
                <span className="text-[10px] font-mono-aerospace text-[var(--success)]">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
