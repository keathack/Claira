import { useState, useEffect } from "react";
import { ArrowLeft, FileText, AlertCircle, ChevronRight, ClipboardList, ChevronDown, ChevronUp, Copy, Check, Pill, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SummaryData {
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

function SummarySection({
  title, icon, iconBg, badge, expanded, onToggle, content,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  content: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#d1d9e6] overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-4 text-left">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <span className="flex-1 text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        {badge && <span className="text-[#a9b9d0] mr-2" style={{ fontSize: 12 }}>{badge}</span>}
        {expanded ? <ChevronUp className="w-4 h-4 text-[#a9b9d0]" /> : <ChevronDown className="w-4 h-4 text-[#a9b9d0]" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#7a94b6]" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</p>
      <p className="text-[#32415a] mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

function VisitDetail({ visit, onBack }: { visit: VisitLog; onBack: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>("diagnosis");
  const [copied, setCopied] = useState(false);
  const { summary } = visit;

  const formattedDate = new Date(visit.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
      className="px-5 pt-14 pb-8 min-h-screen"
      style={{ fontFamily: "'Area Normal', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white border border-[#d1d9e6] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#32415a]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[#1e2533]" style={{ fontSize: 20, fontWeight: 600 }}>Visit Summary</h1>
          <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{formattedDate}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#577399]/10 flex items-center justify-center">
          <ClipboardList className="w-4 h-4 text-[#577399]" />
        </div>
      </div>

      <div className="space-y-4">
        {/* DIAGNOSIS */}
        <SummarySection
          title="Your Diagnosis"
          icon={<FileText className="w-4 h-4 text-[#577399]" />}
          iconBg="bg-[#577399]/10"
          expanded={expandedSection === "diagnosis"}
          onToggle={() => toggleSection("diagnosis")}
          content={
            summary.diagnosis ? (
              <div className="bg-[#f5f7fa] rounded-xl p-4">
                <p className="text-[#32415a]" style={{ fontSize: 14, lineHeight: 1.7 }}>{summary.diagnosis}</p>
              </div>
            ) : (
              <div className="bg-[#f5f7fa] rounded-xl p-4">
                <p className="text-[#a9b9d0]" style={{ fontSize: 14 }}>No diagnosis recorded.</p>
              </div>
            )
          }
        />

        {/* MEDICATIONS */}
        <SummarySection
          title="Your Medications"
          icon={<Pill className="w-4 h-4 text-[#465e83]" />}
          iconBg="bg-[#465e83]/10"
          badge={summary.medications.length.toString()}
          expanded={expandedSection === "medications"}
          onToggle={() => toggleSection("medications")}
          content={
            summary.medications.length > 0 ? (
              <div className="space-y-3">
                {summary.medications.map((med, i) => (
                  <div key={i} className="bg-[#f5f7fa] rounded-xl p-4 space-y-3">
                    <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</p>
                    <MedField label="What it does" value={med.whatItDoes} />
                    <MedField label="How to take it" value={med.howToTake} />
                    <MedField label="Side effects to watch for" value={med.sideEffects} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f5f7fa] rounded-xl p-4">
                <p className="text-[#a9b9d0]" style={{ fontSize: 14 }}>No medications recorded.</p>
              </div>
            )
          }
        />

        {/* NEXT STEPS */}
        <SummarySection
          title="Your Next Steps"
          icon={<AlertCircle className="w-4 h-4 text-[#d4183d]" />}
          iconBg="bg-[#d4183d]/8"
          badge={summary.nextSteps.length.toString()}
          expanded={expandedSection === "nextsteps"}
          onToggle={() => toggleSection("nextsteps")}
          content={
            summary.nextSteps.length > 0 ? (
              <div className="space-y-2">
                {summary.nextSteps.map((s, i) => (
                  <div key={i} className="bg-[#f5f7fa] rounded-xl p-4 flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#577399]/12 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{s.title}</p>
                      <p className="text-[#7a94b6]" style={{ fontSize: 13, lineHeight: 1.6 }}>{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f5f7fa] rounded-xl p-4">
                <p className="text-[#a9b9d0]" style={{ fontSize: 14 }}>No next steps recorded.</p>
              </div>
            )
          }
        />

        {/* Disclaimer */}
        <div className="bg-[#eaedf4] rounded-2xl p-4">
          <p className="text-[#7a94b6] text-center" style={{ fontSize: 12, lineHeight: 1.6 }}>
            This summary reflects what your doctor shared during your visit. It is not medical advice. Always follow your care team's guidance.
          </p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-2xl bg-[#577399] text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1e2533]" style={{ fontSize: 24, fontWeight: 700 }}>Visits</h1>
          <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>
            {visits.length === 0 ? "No visits saved yet" : `${visits.length} visit${visits.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        <button
          onClick={onNewVisit}
          className="px-4 py-2 rounded-xl bg-[#577399] text-white flex items-center gap-1.5"
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          <Mic className="w-3.5 h-3.5" />
          New Visit
        </button>
      </div>

      {/* Empty State */}
      {visits.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 text-center" style={{ minHeight: "calc(100vh - 220px)" }}>
          <div className="w-16 h-16 rounded-full border border-[#d1d9e6] flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-[#1e2533]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>No visits yet</p>
            <p className="text-[#a9b9d0]" style={{ fontSize: 13, lineHeight: 1.6 }}>
              After you record a visit summary, save it here to review anytime.
            </p>
          </div>
          <button
            onClick={onNewVisit}
            className="w-full bg-[#577399] text-white rounded-2xl py-4"
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
                className="w-full bg-white rounded-2xl border border-[#d1d9e6] p-4 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 600 }}>{formattedDate}</p>
                    <p className="text-[#7a94b6] mt-1 leading-relaxed" style={{ fontSize: 13 }}>
                      {diagnosisPreview}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {visit.summary.medications.length > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#465e83]/8 text-[#465e83] rounded-lg px-2.5 py-1" style={{ fontSize: 11, fontWeight: 500 }}>
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
                  <ChevronRight className="w-4 h-4 text-[#a9b9d0] shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
