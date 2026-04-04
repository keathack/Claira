import { useEffect, useState } from "react";
import { ChevronRight, Heart, Activity, AlertCircle, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loadVisits, VisitLog } from "./Visits";

const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

interface SymptomEntry {
  id: string;
  date: string;
  time: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

const SEVERITY_COLORS: Record<number, string> = {
  1: "#577399", 2: "#7a94b6", 3: "#e6a817", 4: "#d4813d", 5: "#d4183d",
};
const SEVERITY_LABELS: Record<number, string> = {
  1: "Mild", 2: "Slight", 3: "Moderate", 4: "Strong", 5: "Severe",
};

const DEMO_SYMPTOMS: SymptomEntry[] = [
  { id: "1", date: "Mar 29, 2026", time: "8:30 AM", symptom: "Nausea", severity: 2, notes: "Mild nausea after taking Metformin." },
  { id: "2", date: "Mar 28, 2026", time: "3:00 PM", symptom: "Dizziness", severity: 3, notes: "Felt lightheaded when standing up quickly." },
  { id: "3", date: "Mar 27, 2026", time: "9:00 PM", symptom: "Fatigue", severity: 2, notes: "Unusually tired in the evening." },
];

const DEMO_VITALS = [
  { id: "1", date: "Mar 29, 2026", label: "Heart Rate", value: "72", unit: "bpm", status: "Normal" },
  { id: "2", date: "Mar 27, 2026", label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "Normal" },
  { id: "3", date: "Mar 25, 2026", label: "SpO2", value: "98", unit: "%", status: "Normal" },
];

type FolderKey = "visits" | "symptoms" | "vitals" | null;

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [openFolder, setOpenFolder] = useState<FolderKey>(null);
  const [visits, setVisits] = useState<VisitLog[]>([]);

  useEffect(() => {
    setVisits(loadVisits());
  }, []);

  const toggle = (key: FolderKey) =>
    setOpenFolder((prev) => (prev === key ? null : key));

  const lastVisitDate = visits.length > 0
    ? new Date(visits[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const lastSymptom = DEMO_SYMPTOMS[0];
  const lastVital = DEMO_VITALS[0];

  return (
    <div className="flex flex-col min-h-screen pb-24 px-5 pt-14" style={{ fontFamily: "'Area Normal', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{today}</p>
          <h1 className="text-[#1e2533] mt-0.5" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
            Welcome to Claira
          </h1>
        </div>
        <button
          onClick={() => onNavigate("/more")}
          className="w-11 h-11 rounded-full bg-[#577399] flex items-center justify-center shadow-sm"
        >
          <span className="text-white" style={{ fontSize: 15, fontWeight: 700 }}>A</span>
        </button>
      </div>

      {/* Folders */}
      <div className="flex flex-col gap-4">

        {/* ── Visits Folder ── */}
        <Folder
          label="Visits"
          isOpen={openFolder === "visits"}
          onToggle={() => toggle("visits")}
          summary={
            lastVisitDate ? (
              <div className="flex items-center justify-between">
                <span className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>Last visit: {lastVisitDate}</span>
                <span className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{visits.length} total</span>
              </div>
            ) : (
              <span className="text-[#a9b9d0]" style={{ fontSize: 14 }}>No visits recorded yet</span>
            )
          }
        >
          {visits.length === 0 ? (
            <EmptyState icon={<Sparkles className="w-5 h-5 text-[#577399]" />} message="No visits yet" />
          ) : (
            <>
              {visits.slice(0, 3).map((v) => {
                const date = new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const preview = v.summary.diagnosis?.slice(0, 50) + (v.summary.diagnosis?.length > 50 ? "…" : "") || "No diagnosis";
                return (
                  <ListRow
                    key={v.id}
                    left={<Sparkles className="w-4 h-4 text-[#577399]" />}
                    primary={date}
                    secondary={preview}
                  />
                );
              })}
              <ExpandButton onClick={() => onNavigate("/visits")} />
            </>
          )}
        </Folder>

        {/* ── Symptoms Folder ── */}
        <Folder
          label="Symptoms"
          isOpen={openFolder === "symptoms"}
          onToggle={() => toggle("symptoms")}
          summary={
            lastSymptom ? (
              <div className="flex items-center justify-between">
                <span className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>Last: {lastSymptom.symptom}</span>
                <span className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{lastSymptom.date}</span>
              </div>
            ) : (
              <span className="text-[#a9b9d0]" style={{ fontSize: 14 }}>No symptoms logged yet</span>
            )
          }
        >
          {DEMO_SYMPTOMS.slice(0, 3).map((s) => (
            <ListRow
              key={s.id}
              left={
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: SEVERITY_COLORS[s.severity], fontSize: 12, fontWeight: 700 }}
                >
                  {s.severity}
                </span>
              }
              primary={s.symptom}
              secondary={`${SEVERITY_LABELS[s.severity]} · ${s.date}`}
            />
          ))}
          <ExpandButton onClick={() => onNavigate("/symptoms")} />
        </Folder>

        {/* ── Vitals Folder ── */}
        <Folder
          label="Vitals"
          isOpen={openFolder === "vitals"}
          onToggle={() => toggle("vitals")}
          summary={
            <div className="flex items-center justify-between">
              <span className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>
                {lastVital.label}: <strong>{lastVital.value}</strong> {lastVital.unit}
              </span>
              <span className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{lastVital.date}</span>
            </div>
          }
        >
          {DEMO_VITALS.slice(0, 3).map((v) => (
            <ListRow
              key={v.id}
              left={
                <div className="w-8 h-8 rounded-xl bg-[#577399]/10 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-[#577399]" />
                </div>
              }
              primary={`${v.label}: ${v.value} ${v.unit}`}
              secondary={`${v.status} · ${v.date}`}
            />
          ))}
          <ExpandButton onClick={() => onNavigate("/vitals")} />
        </Folder>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

interface FolderProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  children: React.ReactNode;
}

function Folder({ label, isOpen, onToggle, summary, children }: FolderProps) {
  return (
    <div>
      {/* Tab */}
      <div className="flex items-end" style={{ paddingLeft: 2 }}>
        <button
          onClick={onToggle}
          className="px-4 py-2 rounded-t-2xl transition-colors"
          style={{
            background: isOpen ? "white" : "#e8ecf2",
            fontSize: 14,
            fontWeight: 600,
            color: isOpen ? "#1e2533" : "#7a94b6",
            boxShadow: isOpen ? "0 -2px 8px rgba(0,0,0,0.06)" : "none",
            position: "relative",
            zIndex: isOpen ? 2 : 1,
          }}
        >
          {label}
        </button>
      </div>

      {/* Folder Body */}
      <div
        className="rounded-b-3xl rounded-tr-3xl"
        style={{
          background: "white",
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        {/* Summary row — always visible */}
        <button
          onClick={onToggle}
          className="w-full px-5 py-4 text-left flex items-center gap-2"
        >
          <div className="flex-1">{summary}</div>
          <ChevronRight
            className="w-4 h-4 text-[#d1d9e6] shrink-0 transition-transform"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* Expanded content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-[#f0f3f8] px-5 pt-3 pb-4 flex flex-col gap-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ListRowProps {
  left: React.ReactNode;
  primary: string;
  secondary: string;
}

function ListRow({ left, primary, secondary }: ListRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="shrink-0">{left}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[#1e2533]" style={{ fontSize: 13, fontWeight: 600 }}>{primary}</p>
        <p className="text-[#a9b9d0] truncate" style={{ fontSize: 12 }}>{secondary}</p>
      </div>
    </div>
  );
}

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-1 py-2.5 rounded-xl bg-[#f5f7fa] text-[#577399] flex items-center justify-center gap-1.5 transition-colors hover:bg-[#eaedf4]"
      style={{ fontSize: 13, fontWeight: 600 }}
    >
      See all <ChevronRight className="w-3.5 h-3.5" />
    </button>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex items-center gap-3 py-2 text-[#a9b9d0]">
      {icon}
      <span style={{ fontSize: 13 }}>{message}</span>
    </div>
  );
}
