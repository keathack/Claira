import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle, ChevronRight, ClipboardList, Copy, Check, Pill } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function DiagnosisContent({ text, conditionName }: { text: string; conditionName?: string }) {
  const [overview, management] = text.split("\n\n");
  const alertMarker = ". If your blood sugar";
  const alertIdx = management?.indexOf(alertMarker) ?? -1;
  const dayToDay = alertIdx !== -1 ? management.slice(0, alertIdx + 1) : management;
  const alertText = alertIdx !== -1 ? "If your blood sugar" + management.slice(alertIdx + alertMarker.length) : null;

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="space-y-1.5">
        {conditionName && (
          <p className="text-kashmir-blue-950" style={{ fontSize: 20, fontWeight: 700 }}>{conditionName}</p>
        )}
        <p className="text-kashmir-blue-800" style={{ fontSize: 15, lineHeight: 1.85 }}>{overview}</p>
      </div>

      {/* Day to Day */}
      {dayToDay && (
        <div className="space-y-1.5">
          <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Day to Day</p>
          <p className="text-kashmir-blue-800" style={{ fontSize: 15, lineHeight: 1.85 }}>{dayToDay}</p>
        </div>
      )}

      {/* When to Call card */}
      {alertText && (
        <div className="bg-kashmir-blue-500/10 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-kashmir-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-kashmir-blue-500" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>When to Call</p>
            <p className="text-kashmir-blue-800 mt-1" style={{ fontSize: 14, lineHeight: 1.7 }}>{alertText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryData {
  conditionName?: string;
  diagnosis: string;
  medications: { name: string; whatItDoes: string; howToTake: string; sideEffects: string }[];
  nextSteps: { title: string; description: string }[];
}

export interface VisitLog {
  id: string;
  date: string;
  summary: SummaryData;
}

const STORAGE_KEY = "claira_visits";

export function loadVisits(): VisitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVisit(summary: SummaryData): VisitLog {
  const visits = loadVisits();
  const entry: VisitLog = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    summary,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...visits]));
  return entry;
}


const NEXT_STEPS_KEY = "claira_next_steps";

function loadStepState(visitId: string): { currentIndex: number; completedIndices: number[] } {
  try {
    const raw = localStorage.getItem(NEXT_STEPS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[visitId] ?? { currentIndex: 0, completedIndices: [] };
  } catch { return { currentIndex: 0, completedIndices: [] }; }
}

function saveStepState(visitId: string, state: { currentIndex: number; completedIndices: number[] }) {
  try {
    const raw = localStorage.getItem(NEXT_STEPS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    localStorage.setItem(NEXT_STEPS_KEY, JSON.stringify({ ...all, [visitId]: state }));
  } catch {}
}

function VisitDetail({ visit, onBack }: { visit: VisitLog; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"Diagnosis" | "Medications" | "Next Steps">("Diagnosis");
  const [copied, setCopied] = useState(false);
  const [stepState, setStepState] = useState(() => loadStepState(visit.id));
  const { summary } = visit;

  function handleToggleStep(i: number) {
    const isCompleted = stepState.completedIndices.includes(i);
    const newCompleted = isCompleted
      ? stepState.completedIndices.filter((x) => x !== i)
      : [...stepState.completedIndices, i];
    const newState = { currentIndex: stepState.currentIndex, completedIndices: newCompleted };
    setStepState(newState);
    saveStepState(visit.id, newState);
  }

  const handleCopy = () => {
    const text = `YOUR DIAGNOSIS\n${summary.diagnosis}\n\nYOUR MEDICATIONS\n${summary.medications.map((m) => `${m.name}\n- What it does: ${m.whatItDoes}\n- How to take it: ${m.howToTake}\n- Side effects: ${m.sideEffects}`).join("\n\n")}\n\nYOUR NEXT STEPS\n${summary.nextSteps.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join("\n")}\n\nThis summary reflects what your doctor shared during your visit. It is not medical advice.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col min-h-screen"
      style={{ fontFamily: "'Area Normal', sans-serif" }}
    >
      {/* Hero Header */}
      <div className="px-5 pt-14 pb-10 bg-kashmir-blue-50">
        <div className="flex items-center justify-between mb-10">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/70 border border-kashmir-blue-200 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-kashmir-blue-800" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-kashmir-blue-500/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-kashmir-blue-500" />
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <p className="text-kashmir-blue-400" style={{ fontSize: 13 }}>Visit Summary</p>
          <p className="text-kashmir-blue-950 mt-1" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
            {new Date(visit.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <p className="text-kashmir-blue-300" style={{ fontSize: 13 }}>
            {new Date(visit.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* White sheet */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-5 px-5 pt-6 pb-24">
        {/* Tab Switcher */}
        <div className="bg-[#f0f2f6] rounded-2xl p-1 flex gap-1 mb-6">
          {(["Diagnosis", "Medications", "Next Steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl transition-all ${activeTab === tab ? "bg-white text-kashmir-blue-950" : "text-kashmir-blue-300"}`}
              style={{ fontSize: 12, fontWeight: activeTab === tab ? 600 : 400 }}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "Diagnosis" && (
              summary.diagnosis
                ? <DiagnosisContent text={summary.diagnosis} conditionName={summary.conditionName} />
                : <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No diagnosis recorded.</p>
            )}

            {activeTab === "Medications" && (
              <div className="space-y-4">
                {summary.medications.length === 0
                  ? <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No medications recorded.</p>
                  : summary.medications.map((med, i) => (
                    <div key={i} className="bg-kashmir-blue-50 rounded-2xl p-4 space-y-3">
                      <p className="text-kashmir-blue-950" style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</p>
                      <div>
                        <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>What it does</p>
                        <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.whatItDoes}</p>
                      </div>
                      <div>
                        <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>How to take it</p>
                        <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.howToTake}</p>
                      </div>
                      <div>
                        <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Side effects</p>
                        <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.sideEffects}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab === "Next Steps" && (
              summary.nextSteps.length === 0
                ? <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No next steps recorded.</p>
                : (
                  <div className="relative">
                    <div className="absolute left-[12px] top-7 bottom-7 w-px bg-kashmir-blue-200" />
                    <div className="space-y-5">
                      {summary.nextSteps.map((s, i) => {
                        const isCompleted = stepState.completedIndices.includes(i);
                        return (
                          <button key={i} onClick={() => handleToggleStep(i)} className="flex gap-4 items-start w-full text-left">
                            <div className={`w-[26px] h-[26px] rounded-[6px] flex items-center justify-center shrink-0 relative z-10 transition-colors ${isCompleted ? "bg-kashmir-blue-600" : "bg-white border border-kashmir-blue-200"}`}>
                              {isCompleted
                                ? <Check className="w-3.5 h-3.5 text-kashmir-blue-50" strokeWidth={2.5} />
                                : <span className="text-kashmir-blue-500" style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                              }
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5">
                              <p className={`transition-colors ${isCompleted ? "text-kashmir-blue-300 line-through" : "text-kashmir-blue-950"}`} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{s.title}</p>
                              <p className={`transition-colors ${isCompleted ? "text-kashmir-blue-200" : "text-kashmir-blue-400"}`} style={{ fontSize: 13, lineHeight: 1.6 }}>{s.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-kashmir-blue-300 text-center mt-8 mb-4" style={{ fontSize: 12, lineHeight: 1.6 }}>
          Not medical advice. Always follow your care team's guidance.
        </p>

        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl bg-kashmir-blue-500 text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Summary"}
        </button>
      </div>
    </motion.div>
  );
}

interface VisitsProps {
  onNewVisit: () => void;
}

export function Visits({ onNewVisit }: VisitsProps) {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitLog | null>(null);

  useEffect(() => {
    setVisits(loadVisits());
  }, []);

  if (selectedVisit) {
    return (
      <AnimatePresence mode="wait">
        <VisitDetail
          key={selectedVisit.id}
          visit={selectedVisit}
          onBack={() => setSelectedVisit(null)}
        />
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-5 pt-14 pb-24 min-h-screen"
      style={{ fontFamily: "'Area Normal', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-kashmir-blue-950" style={{ fontSize: 24, fontWeight: 700 }}>Visits</h1>
        <p className="text-kashmir-blue-300" style={{ fontSize: 13 }}>
          {visits.length === 0 ? "No visits saved yet" : `${visits.length} visit${visits.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {/* ── Record Visit Card ── */}
      <div
        className="bg-kashmir-blue-500 rounded-[20px] px-[14px] py-[18px] flex flex-col items-center gap-4 text-center mb-6"
        style={{ boxShadow: "0 4px 20px rgba(87,115,153,0.3)" }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-kashmir-blue-50" style={{ fontSize: 17, fontWeight: 700 }}>
            Record your visit
          </p>
          <p className="text-kashmir-blue-50" style={{ fontSize: 12, opacity: 0.8 }}>
            Capture what your doctor shared while it's fresh
          </p>
        </div>
        <button
          onClick={onNewVisit}
          className="bg-kashmir-blue-50 text-kashmir-blue-500 rounded-full px-5 py-2.5"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          Start recording
        </button>
      </div>

      {/* Empty State */}
      {visits.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 text-center" style={{ minHeight: "calc(100vh - 220px)" }}>
          <div className="w-16 h-16 rounded-full border border-kashmir-blue-200 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-kashmir-blue-950" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-kashmir-blue-950" style={{ fontSize: 15, fontWeight: 600 }}>No visits yet</p>
            <p className="text-kashmir-blue-300" style={{ fontSize: 13, lineHeight: 1.6 }}>
              After you record a visit summary, save it here to review anytime.
            </p>
          </div>
          <button
            onClick={onNewVisit}
            className="w-full bg-kashmir-blue-500 text-white rounded-2xl py-4"
            style={{ fontSize: 16, fontWeight: 600 }}
          >
            Record a visit
          </button>
        </div>
      )}

      {/* Visit List */}
      {visits.length > 0 && (
        <div className="space-y-3">
          {visits.map((visit) => {
            const date = new Date(visit.date);
            const formattedDate = date.toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric", year: "numeric",
            });
            const diagnosisPreview = visit.summary.diagnosis
              ? visit.summary.diagnosis.slice(0, 90) + (visit.summary.diagnosis.length > 90 ? "…" : "")
              : "No diagnosis recorded";

            return (
              <button
                key={visit.id}
                onClick={() => setSelectedVisit(visit)}
                className="w-full bg-white rounded-2xl border border-kashmir-blue-200 p-4 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-kashmir-blue-950" style={{ fontSize: 14, fontWeight: 600 }}>{formattedDate}</p>
                    <p className="text-kashmir-blue-400 mt-1 leading-relaxed" style={{ fontSize: 13 }}>
                      {diagnosisPreview}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {visit.summary.medications.length > 0 && (
                        <span className="inline-flex items-center gap-1 bg-kashmir-blue-600/8 text-kashmir-blue-600 rounded-lg px-2.5 py-1" style={{ fontSize: 11, fontWeight: 500 }}>
                          <Pill className="w-3 h-3" />
                          {visit.summary.medications.length} med{visit.summary.medications.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {visit.summary.nextSteps.length > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#d4183d]/6 text-[#d4183d] rounded-lg px-2.5 py-1" style={{ fontSize: 11, fontWeight: 500 }}>
                          <AlertCircle className="w-3 h-3" />
                          {visit.summary.nextSteps.length} step{visit.summary.nextSteps.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-kashmir-blue-300 shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
