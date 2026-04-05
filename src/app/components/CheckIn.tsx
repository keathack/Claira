import { useState } from "react";
import { ArrowLeft, Plus, Sparkles, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const CHECKIN_KEY = "claira_checkins";

export interface CheckInEntry {
  id: string;
  date: string;
  feeling: string;
  symptoms: string;
  overview: string;
}

export function loadCheckIns(): CheckInEntry[] {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCheckIn(entry: CheckInEntry) {
  const existing = loadCheckIns();
  localStorage.setItem(CHECKIN_KEY, JSON.stringify([entry, ...existing]));
}

function generateOverview(feeling: string, symptoms: string): string {
  const parts: string[] = [];
  if (feeling.trim()) parts.push(`You described feeling: "${feeling.trim()}".`);
  if (symptoms.trim()) parts.push(`Concerns or symptoms noted: "${symptoms.trim()}".`);
  parts.push("Bring this summary to your next appointment so your doctor has a clear picture of how you've been doing between visits.");
  return parts.join(" ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface CheckInProps {
  onBack: () => void;
}

type View = "list" | "detail" | "form" | "loading" | "result";

export function CheckIn({ onBack }: CheckInProps) {
  const [view, setView] = useState<View>("list");
  const [entries, setEntries] = useState<CheckInEntry[]>(() => loadCheckIns());
  const [selected, setSelected] = useState<CheckInEntry | null>(null);

  // Form state
  const [feeling, setFeeling] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [overview, setOverview] = useState("");

  function handleSubmit() {
    if (!feeling.trim() && !symptoms.trim()) return;
    setView("loading");
    setTimeout(() => {
      const generated = generateOverview(feeling, symptoms);
      setOverview(generated);
      const entry: CheckInEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        feeling,
        symptoms,
        overview: generated,
      };
      saveCheckIn(entry);
      setEntries(loadCheckIns());
      setView("result");
    }, 1400);
  }

  function handleNewCheckIn() {
    setFeeling("");
    setSymptoms("");
    setOverview("");
    setView("form");
  }

  function handleDone() {
    setView("list");
  }

  function handleViewEntry(entry: CheckInEntry) {
    setSelected(entry);
    setView("detail");
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen pb-10 px-5 pt-14">
      <AnimatePresence mode="wait">

        {/* ── Log List ── */}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{today}</p>
                <h1 className="text-[#1e2533] mt-0.5" style={{ fontSize: 22, fontWeight: 700 }}>Check-in</h1>
              </div>
              <button
                onClick={handleNewCheckIn}
                className="w-10 h-10 rounded-full bg-[#577399] flex items-center justify-center shrink-0"
                style={{ boxShadow: "0 4px 12px rgba(87,115,153,0.35)" }}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
              >
                <div className="w-14 h-14 rounded-full bg-[#eaedf4] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#a9b9d0]" />
                </div>
                <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>No check-ins yet</p>
                <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>
                  Tap + to log how you've been feeling.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleViewEntry(entry)}
                    className="bg-white rounded-2xl p-5 flex items-start justify-between gap-3 text-left w-full"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>
                        {formatDate(entry.date)}
                      </p>
                      <p
                        className="text-[#1e2533] truncate"
                        style={{ fontSize: 15, fontWeight: 500 }}
                      >
                        {entry.feeling || entry.symptoms || "Check-in"}
                      </p>
                      <p
                        className="text-[#7a94b6] line-clamp-2"
                        style={{ fontSize: 13, lineHeight: "1.5" }}
                      >
                        {entry.overview}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#d1d9e6] shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Detail View ── */}
        {view === "detail" && selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setView("list")}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}
              >
                <ArrowLeft className="w-4 h-4 text-[#394c6b]" />
              </button>
              <div>
                <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{formatDate(selected.date)}</p>
                <p className="text-[#1e2533]" style={{ fontSize: 17, fontWeight: 700 }}>Check-in</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>OVERVIEW</p>
              <p className="text-[#1e2533]" style={{ fontSize: 15, lineHeight: "1.65" }}>{selected.overview}</p>
            </div>

            {selected.feeling.trim() && (
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>HOW YOU FELT</p>
                <p className="text-[#394c6b]" style={{ fontSize: 14, lineHeight: "1.6" }}>{selected.feeling}</p>
              </div>
            )}

            {selected.symptoms.trim() && (
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>SYMPTOMS & CONCERNS</p>
                <p className="text-[#394c6b]" style={{ fontSize: 14, lineHeight: "1.6" }}>{selected.symptoms}</p>
              </div>
            )}

            <p className="text-center text-[#a9b9d0]" style={{ fontSize: 11 }}>
              Not medical advice. Always follow your care team's guidance.
            </p>
          </motion.div>
        )}

        {/* ── New Check-in Form ── */}
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("list")}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}
              >
                <ArrowLeft className="w-4 h-4 text-[#394c6b]" />
              </button>
              <div>
                <h1 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 700 }}>New Check-in</h1>
                <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{today}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                HOW HAVE YOU BEEN FEELING LATELY?
              </p>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Describe how you've been feeling in your own words..."
                rows={5}
                className="w-full bg-white rounded-2xl px-4 py-4 text-[#1e2533] outline-none resize-none"
                style={{ fontSize: 15, lineHeight: "1.6", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                ANY PAINS, CONCERNS, OR SYMPTOMS?
              </p>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="List anything you've noticed — aches, changes, concerns..."
                rows={5}
                className="w-full bg-white rounded-2xl px-4 py-4 text-[#1e2533] outline-none resize-none"
                style={{ fontSize: 15, lineHeight: "1.6", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!feeling.trim() && !symptoms.trim()}
              className="w-full bg-[#577399] text-white rounded-2xl py-4 transition-opacity"
              style={{ fontSize: 15, fontWeight: 600, opacity: feeling.trim() || symptoms.trim() ? 1 : 0.4 }}
            >
              Generate overview
            </button>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 gap-5 pt-32"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-[#d1d9e6] border-t-[#577399]"
            />
            <p className="text-[#a9b9d0]" style={{ fontSize: 14 }}>Generating your overview...</p>
          </motion.div>
        )}

        {/* ── Result ── */}
        {view === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col items-center gap-3 pt-2 pb-4">
              <div className="w-16 h-16 rounded-full bg-[#eaedf4] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#577399]" />
              </div>
              <div className="text-center">
                <h2 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 700 }}>Your Overview</h2>
                <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>
                  Saved · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>OVERVIEW</p>
              <p className="text-[#1e2533]" style={{ fontSize: 15, lineHeight: "1.65" }}>{overview}</p>
            </div>

            {feeling.trim() && (
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>HOW YOU FELT</p>
                <p className="text-[#394c6b]" style={{ fontSize: 14, lineHeight: "1.6" }}>{feeling}</p>
              </div>
            )}

            {symptoms.trim() && (
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>SYMPTOMS & CONCERNS</p>
                <p className="text-[#394c6b]" style={{ fontSize: 14, lineHeight: "1.6" }}>{symptoms}</p>
              </div>
            )}

            <p className="text-center text-[#a9b9d0]" style={{ fontSize: 11 }}>
              Not medical advice. Always follow your care team's guidance.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleNewCheckIn}
                className="flex-1 bg-[#eaedf4] text-[#394c6b] rounded-2xl py-3.5"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                New check-in
              </button>
              <button
                onClick={handleDone}
                className="flex-1 bg-[#577399] text-white rounded-2xl py-3.5"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
