import { useState } from "react";
import { MoreHorizontal, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { loadVisits } from "./Visits";

// ── Storage keys ──────────────────────────────────────────
const MED_TIMING_KEY = "claira_med_timing";
const MED_TAKEN_KEY = "claira_med_taken";
const NEXT_STEPS_KEY = "claira_next_steps";

// ── Types ─────────────────────────────────────────────────
interface MedTiming {
  [key: string]: string; // "MedName_Period" → "8:00 AM"
}

interface MedTaken {
  [dateStr: string]: string[]; // date → ["MedName_Period", ...]
}

interface NextStepsProgress {
  [visitId: string]: {
    currentIndex: number;
    completedIndices: number[];
  };
}

interface MedRowData {
  name: string;
  period: string;
  time: string;
  overdue: boolean;
  taken: boolean;
}

// ── Helpers ───────────────────────────────────────────────
function todayStr() {
  return new Date().toDateString();
}

function parseDoses(howToTake: string): { period: string; defaultTime: string }[] {
  const lower = howToTake.toLowerCase();
  if (lower.includes("twice a day") || lower.includes("twice daily")) {
    return [
      { period: "Morning", defaultTime: "8:00 AM" },
      { period: "Evening", defaultTime: "5:00 PM" },
    ];
  }
  return [{ period: "Morning", defaultTime: "8:00 AM" }];
}

function isOverdue(timeStr: string): boolean {
  if (!timeStr) return false;
  const parts = timeStr.split(" ");
  if (parts.length < 2) return false;
  const [hm, meridiem] = parts;
  const [hh, mm] = hm.split(":").map(Number);
  let h = hh;
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  const scheduled = new Date();
  scheduled.setHours(h, mm, 0, 0);
  return new Date() > scheduled;
}

function to24h(display: string): string {
  const parts = display.split(" ");
  if (parts.length < 2) return "08:00";
  const [time, mer] = parts;
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function to12h(val: string): string {
  const [h, m] = val.split(":").map(Number);
  const mer = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${mer}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ── Component ─────────────────────────────────────────────
interface DashboardProps {
  onNavigate: (path: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const visits = loadVisits();
  const lastVisit = visits[0] ?? null;

  const [medTiming, setMedTiming] = useState<MedTiming>(() =>
    loadJSON(MED_TIMING_KEY, {})
  );
  const [medTaken, setMedTaken] = useState<MedTaken>(() =>
    loadJSON(MED_TAKEN_KEY, {})
  );
  const [stepsProgress, setStepsProgress] = useState<NextStepsProgress>(() =>
    loadJSON(NEXT_STEPS_KEY, {})
  );

  const [editingMed, setEditingMed] = useState<{ name: string; period: string } | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editAlarm, setEditAlarm] = useState(false);
  const [justChecked, setJustChecked] = useState(false);

  const today = todayStr();
  const takenToday = medTaken[today] ?? [];

  // Build medication schedule from last visit
  const medSchedule: MedRowData[] = [];
  if (lastVisit) {
    for (const med of lastVisit.summary.medications) {
      for (const dose of parseDoses(med.howToTake)) {
        const key = `${med.name}_${dose.period}`;
        const time = medTiming[key] ?? dose.defaultTime;
        const taken = takenToday.includes(key);
        medSchedule.push({
          name: med.name,
          period: dose.period,
          time,
          overdue: !taken && isOverdue(time),
          taken,
        });
      }
    }
  }

  const morningMeds = medSchedule.filter((m) => m.period === "Morning");
  const eveningMeds = medSchedule.filter((m) => m.period === "Evening");

  // Next steps state
  const nextSteps = lastVisit?.summary.nextSteps ?? [];
  const visitId = lastVisit?.id ?? "";
  const stepState = stepsProgress[visitId] ?? { currentIndex: 0, completedIndices: [] };
  const currentIndex = Math.min(stepState.currentIndex, nextSteps.length - 1);
  const currentStep = nextSteps[currentIndex] ?? null;
  const allDone = stepState.completedIndices.length >= nextSteps.length;
  const remainingAfter = nextSteps.length - stepState.completedIndices.length - 1;

  function handleCheckStep() {
    if (!lastVisit || !currentStep || justChecked || allDone) return;
    setJustChecked(true);
    setTimeout(() => {
      const newCompleted = [...stepState.completedIndices, currentIndex];
      const nextIdx = currentIndex + 1 < nextSteps.length ? currentIndex + 1 : currentIndex;
      const updated = {
        ...stepsProgress,
        [visitId]: { currentIndex: nextIdx, completedIndices: newCompleted },
      };
      setStepsProgress(updated);
      localStorage.setItem(NEXT_STEPS_KEY, JSON.stringify(updated));
      setJustChecked(false);
    }, 550);
  }

  function handleTakeMed(name: string, period: string) {
    const key = `${name}_${period}`;
    const updated = takenToday.includes(key)
      ? takenToday.filter((k) => k !== key)
      : [...takenToday, key];
    const newTaken = { ...medTaken, [today]: updated };
    setMedTaken(newTaken);
    localStorage.setItem(MED_TAKEN_KEY, JSON.stringify(newTaken));
  }

  function handleOpenEdit(name: string, period: string) {
    const key = `${name}_${period}`;
    setEditTime(medTiming[key] ?? (period === "Morning" ? "8:00 AM" : "5:00 PM"));
    setEditAlarm(false);
    setEditingMed({ name, period });
  }

  function handleSaveEdit() {
    if (!editingMed) return;
    const key = `${editingMed.name}_${editingMed.period}`;
    const newTiming = { ...medTiming, [key]: editTime };
    setMedTiming(newTiming);
    localStorage.setItem(MED_TIMING_KEY, JSON.stringify(newTiming));
    setEditingMed(null);
  }

  const dateDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const visitDateDisplay = lastVisit
    ? new Date(lastVisit.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  return (
    <div className="flex flex-col min-h-screen pb-28 px-5 pt-14">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>{dateDisplay}</p>
          <h1 className="text-[#1e2533] mt-0.5" style={{ fontSize: 22, fontWeight: 700 }}>
            Welcome back, Keaton
          </h1>
        </div>
        <button
          onClick={() => onNavigate("/more")}
          className="w-10 h-10 rounded-[20px] bg-[#577399] flex items-center justify-center shrink-0"
        >
          <span className="text-white" style={{ fontSize: 14, fontWeight: 700 }}>A</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">

        {/* ── Next Steps Card ── */}
        {lastVisit && nextSteps.length > 0 && (
          <div
            className="bg-white rounded-[20px] p-[18px] flex flex-col gap-[10px]"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="text-[#1e2533]" style={{ fontSize: 16, fontWeight: 600 }}>
                  Next Steps
                </p>
                <button
                  onClick={() => onNavigate("/visits")}
                  className="text-[#577399]"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  View all →
                </button>
              </div>
              {visitDateDisplay && (
                <p className="text-[#1e2533]" style={{ fontSize: 12 }}>
                  Diagnosis · {visitDateDisplay}
                </p>
              )}
            </div>

            {allDone ? (
              <div className="flex items-center gap-[10px]">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-[#465e83] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#f5f7fa]" strokeWidth={2.5} />
                </div>
                <p className="text-[#577399]" style={{ fontSize: 14 }}>
                  All steps completed!
                </p>
              </div>
            ) : (
              <button
                onClick={handleCheckStep}
                className="flex items-start gap-[10px] w-full text-left"
                disabled={justChecked}
              >
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className={`w-[26px] h-[26px] rounded-[6px] flex items-center justify-center transition-colors ${
                      justChecked ? "bg-[#465e83]" : "border border-[#1e2533]"
                    }`}
                  >
                    {justChecked && (
                      <Check className="w-3.5 h-3.5 text-[#f5f7fa]" strokeWidth={2.5} />
                    )}
                  </div>
                  {!allDone && remainingAfter > 0 && (
                    <p className="text-[#1e2533]" style={{ fontSize: 12 }}>
                      {remainingAfter} left
                    </p>
                  )}
                </div>
                <p className="flex-1 text-[#1e2533]" style={{ fontSize: 16, lineHeight: "1.35" }}>
                  {currentStep}
                </p>
              </button>
            )}
          </div>
        )}

        {/* ── Today's Medications Card ── */}
        {lastVisit && medSchedule.length > 0 && (
          <div
            className="bg-white rounded-[20px] p-[18px] flex flex-col gap-[10px]"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[#1e2533]" style={{ fontSize: 16, fontWeight: 600 }}>
                Today's Medications
              </p>
              <button
                onClick={() => onNavigate("/visits")}
                className="text-[#577399]"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                View all →
              </button>
            </div>

            <div className="w-full h-px bg-[#d1d9e6]" />

            {morningMeds.length > 0 && (
              <>
                <p className="text-[#1e2533]" style={{ fontSize: 16, fontWeight: 300 }}>
                  Morning
                </p>
                {morningMeds.map((med) => (
                  <MedRowItem
                    key={`${med.name}_${med.period}`}
                    med={med}
                    onTake={() => handleTakeMed(med.name, med.period)}
                    onEdit={() => handleOpenEdit(med.name, med.period)}
                  />
                ))}
              </>
            )}

            {eveningMeds.length > 0 && (
              <>
                <p className="text-[#1e2533]" style={{ fontSize: 16, fontWeight: 300 }}>
                  Evening
                </p>
                {eveningMeds.map((med) => (
                  <MedRowItem
                    key={`${med.name}_${med.period}`}
                    med={med}
                    onTake={() => handleTakeMed(med.name, med.period)}
                    onEdit={() => handleOpenEdit(med.name, med.period)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── How are you feeling card ── */}
        <div
          className="bg-[#577399] rounded-[20px] px-[14px] py-[18px] flex flex-col gap-[10px]"
          style={{ boxShadow: "0 4px 20px rgba(87,115,153,0.3)" }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-[#f5f7fa]" style={{ fontSize: 17, fontWeight: 700 }}>
              How are you feeling?
            </p>
            <p className="text-[#f5f7fa]" style={{ fontSize: 12 }}>
              Log symptoms to share with your doctor
            </p>
          </div>
          <button
            onClick={() => onNavigate("/checkin")}
            className="bg-[#f5f7fa] rounded-full px-[10px] py-[6px] self-start"
            style={{ fontSize: 12, fontWeight: 600, color: "#577399" }}
          >
            Log now
          </button>
        </div>

        {/* Empty state — no visits yet */}
        {!lastVisit && (
          <div
            className="bg-white rounded-[20px] p-[18px] text-center"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            <p className="text-[#a9b9d0]" style={{ fontSize: 14 }}>
              Record a visit to see your next steps and medications here.
            </p>
          </div>
        )}

      </div>

      {/* ── Medication Edit Sheet ── */}
      <AnimatePresence>
        {editingMed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
            onClick={() => setEditingMed(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="bg-white rounded-t-[28px] w-full max-w-[430px] p-6 pb-10 flex flex-col gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#d1d9e6] rounded-full mx-auto" />

              <p className="text-[#1e2533]" style={{ fontSize: 17, fontWeight: 600 }}>
                {editingMed.name} · {editingMed.period}
              </p>

              <div className="flex flex-col gap-2">
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600 }}>
                  TIME
                </p>
                <input
                  type="time"
                  value={to24h(editTime)}
                  onChange={(e) => setEditTime(to12h(e.target.value))}
                  className="w-full bg-[#f5f7fa] rounded-xl px-4 py-3 text-[#1e2533] outline-none"
                  style={{ fontSize: 16, border: "none" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>
                    Reminder alarm
                  </p>
                  <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>
                    Get notified at the set time
                  </p>
                </div>
                <button
                  onClick={() => setEditAlarm(!editAlarm)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    editAlarm ? "bg-[#577399]" : "bg-[#d1d9e6]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      editAlarm ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full bg-[#577399] text-white rounded-xl py-3.5"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                Save
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Med Row ───────────────────────────────────────────────
function MedRowItem({
  med,
  onTake,
  onEdit,
}: {
  med: MedRowData;
  onTake: () => void;
  onEdit: () => void;
}) {
  const urgent = med.overdue && !med.taken;

  return (
    <div
      className={`flex items-center justify-between p-[6px] rounded-[6px] transition-colors ${
        urgent ? "bg-[#577399]" : ""
      }`}
    >
      <div className="flex items-center gap-[10px]">
        <button
          onClick={onTake}
          className={`w-[25px] h-[25px] rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
            med.taken
              ? "bg-[#465e83]"
              : urgent
              ? "border border-[#f5f7fa]"
              : "border border-[#1e2533]"
          }`}
        >
          {med.taken && (
            <Check className="w-3.5 h-3.5 text-[#f5f7fa]" strokeWidth={2.5} />
          )}
        </button>
        <div className={`flex flex-col ${urgent ? "text-[#f5f7fa]" : "text-[#1e2533]"}`}>
          <span style={{ fontSize: 16, lineHeight: "1.3" }}>{med.name}</span>
          <span style={{ fontSize: 10, lineHeight: "1.5", opacity: urgent ? 0.85 : 0.7 }}>
            {med.time}
          </span>
        </div>
      </div>
      <button onClick={onEdit}>
        <MoreHorizontal
          className="w-5 h-5"
          style={{ color: urgent ? "#f5f7fa" : "#a9b9d0" }}
        />
      </button>
    </div>
  );
}
