import { useState } from "react";
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle, ChevronRight, Share2, Pill, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface VisitPrepProps {
  onBack: () => void;
  onNavigate: (path: string) => void;
  hasUpcomingVisit?: boolean;
  symptomCount?: number;
}

const checklist = [
  { id: "1", label: "Review your last visit summary", done: true },
  { id: "2", label: "Check your symptom log entries", done: true },
  { id: "3", label: "Write down questions for your doctor", done: false },
  { id: "4", label: "Bring your blood sugar log", done: false },
  { id: "5", label: "List any new medications or supplements", done: false },
];

const recentSymptoms = [
  { symptom: "Nausea", count: 3, severity: "Mild" },
  { symptom: "Dizziness", count: 1, severity: "Moderate" },
  { symptom: "Fatigue", count: 2, severity: "Mild" },
];

export function VisitPrep({ onBack, onNavigate, hasUpcomingVisit = true, symptomCount = 3 }: VisitPrepProps) {
  const [items, setItems] = useState(checklist);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const completedCount = items.filter((i) => i.done).length;

  // No upcoming visit state
  if (!hasUpcomingVisit) {
    return (
      <div className="px-5 pt-14 pb-4 min-h-screen" style={{ fontFamily: "'Area Normal', sans-serif" }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white border border-[#d1d9e6] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-[#32415a]" />
          </button>
          <h1 className="text-[#1e2533] flex-1" style={{ fontSize: 20, fontWeight: 600 }}>Visit Prep</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#577399]/8 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-[#577399]" />
          </div>
          <p className="text-[#1e2533] mb-1" style={{ fontSize: 16, fontWeight: 600 }}>No upcoming visit</p>
          <p className="text-[#a9b9d0] mb-6 max-w-[260px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
            When you have an appointment scheduled, your prep checklist will appear here.
          </p>
          <button
            onClick={() => onNavigate("/appointments")}
            className="bg-[#577399] text-white px-6 py-3 rounded-2xl flex items-center gap-2"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4 min-h-screen" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white border border-[#d1d9e6] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#32415a]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[#1e2533]" style={{ fontSize: 20, fontWeight: 600 }}>Visit Prep</h1>
          <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>Get ready for your next appointment</p>
        </div>
        <button className="w-9 h-9 rounded-xl bg-[#577399]/10 flex items-center justify-center">
          <Share2 className="w-4 h-4 text-[#577399]" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Appointment Card */}
        <div className="bg-[#577399] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white" style={{ fontSize: 15, fontWeight: 500 }}>Dr. Sarah Chen — Cardiology</p>
              <p className="text-white/70" style={{ fontSize: 13 }}>Follow-up visit</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-white/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span style={{ fontSize: 13 }}>Mar 31, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span style={{ fontSize: 13 }}>10:00 AM</span>
            </div>
          </div>
          <p className="text-white/50 mt-3" style={{ fontSize: 12 }}>In 2 days</p>
        </div>

        {/* Prep Checklist */}
        <div className="bg-white rounded-2xl border border-[#d1d9e6] p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>Prep Checklist</p>
            <span className="text-[#577399]" style={{ fontSize: 13, fontWeight: 500 }}>{completedCount}/{items.length}</span>
          </div>
          <div className="w-full h-1.5 bg-[#eaedf4] rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-[#577399] rounded-full"
              animate={{ width: `${(completedCount / items.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 py-2.5 text-left"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  item.done ? "bg-[#577399]" : "border-2 border-[#d1d9e6]"
                }`}>
                  {item.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span
                  className={`${item.done ? "text-[#a9b9d0] line-through" : "text-[#32415a]"}`}
                  style={{ fontSize: 14 }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms to Discuss */}
        <div className="bg-white rounded-2xl border border-[#d1d9e6] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>Symptoms to Discuss</p>
            <button onClick={() => onNavigate("/symptoms")} className="text-[#577399]" style={{ fontSize: 13 }}>View Log</button>
          </div>
          {symptomCount === 0 ? (
            <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
              <p className="text-[#a9b9d0]" style={{ fontSize: 13, lineHeight: 1.6 }}>
                No symptoms logged since your last visit. Tap "View Log" to add entries before your appointment.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSymptoms.map((s, i) => (
                <div key={i} className="bg-[#f5f7fa] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[#32415a]" style={{ fontSize: 14, fontWeight: 500 }}>{s.symptom}</p>
                    <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{s.count} occurrences · {s.severity}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#a9b9d0]" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Visit Summary */}
        <button
          onClick={() => onNavigate("/history")}
          className="w-full bg-white rounded-2xl border border-[#d1d9e6] p-4 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#465e83]/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#465e83]" />
          </div>
          <div className="flex-1">
            <p className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>Last Visit Summary</p>
            <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>Mar 15, 2026 — Dr. James Park</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#a9b9d0]" />
        </button>

        {/* Share Button */}
        <button className="w-full py-3.5 rounded-2xl border border-[#d1d9e6] text-[#577399] flex items-center justify-center gap-2" style={{ fontSize: 14, fontWeight: 500 }}>
          <Share2 className="w-4 h-4" /> Share Prep with Doctor
        </button>
      </div>
    </div>
  );
}
