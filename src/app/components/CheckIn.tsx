import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, ChevronRight, NotebookPen, CheckCircle2, Mic, Square, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const CHECKIN_KEY = "claira_checkins";

export interface CheckInEntry {
  id: string;
  date: string;
  feeling: string;
  symptoms: string;
  overview: string;
  symptomTags?: string[];
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

function parseSymptomTags(symptoms: string): string[] {
  if (!symptoms.trim()) return [];
  return symptoms
    .split(/[,;]|\.\s+|\band\b/i)
    .map((s) => s.replace(/^[^a-zA-Z]+/, "").trim())
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .filter((s) => s.length > 3 && s.split(" ").length <= 8);
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
type RecordingField = "feeling" | "symptoms" | null;

const MOCK_FEELING = "I've been feeling pretty tired lately and a bit short of breath when I walk up stairs. My energy levels have been lower than usual and I've been having trouble sleeping through the night.";
const MOCK_SYMPTOMS = "I've noticed some mild chest tightness in the mornings and occasional headaches. My ankles have been a little swollen and I've had some nausea after taking my medication.";

function formatTimer(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function CheckIn({ onBack }: CheckInProps) {
  const [view, setView] = useState<View>("list");
  const [entries, setEntries] = useState<CheckInEntry[]>(() => loadCheckIns());
  const [selected, setSelected] = useState<CheckInEntry | null>(null);

  // Form state
  const [feeling, setFeeling] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Voice state
  const [recordingField, setRecordingField] = useState<RecordingField>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recordingField) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recordingField]);

  function startRecording(field: RecordingField) {
    setRecordingField(field);
  }

  function stopRecording() {
    if (!recordingField) return;
    if (recordingField === "feeling") setFeeling(MOCK_FEELING);
    if (recordingField === "symptoms") setSymptoms(MOCK_SYMPTOMS);
    setRecordingField(null);
  }
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
        symptomTags: parseSymptomTags(symptoms),
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

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editOverview, setEditOverview] = useState("");
  const [editFeeling, setEditFeeling] = useState("");
  const [editSymptoms, setEditSymptoms] = useState("");

  function handleStartEdit(source: { overview: string; feeling: string; symptoms: string }) {
    setEditOverview(source.overview);
    setEditFeeling(source.feeling);
    setEditSymptoms(source.symptoms);
    setEditing(true);
  }

  function handleSaveEdit(entryId: string) {
    const updated: CheckInEntry = {
      id: entryId,
      date: selected?.date ?? new Date().toISOString(),
      feeling: editFeeling,
      symptoms: editSymptoms,
      overview: editOverview,
      symptomTags: parseSymptomTags(editSymptoms),
    };
    const all = loadCheckIns();
    const newAll = all.map((e) => (e.id === entryId ? updated : e));
    localStorage.setItem("claira_checkins", JSON.stringify(newAll));
    setEntries(newAll);
    // Update local view state
    if (view === "detail") setSelected(updated);
    if (view === "result") {
      setOverview(editOverview);
      setFeeling(editFeeling);
      setSymptoms(editSymptoms);
    }
    setEditing(false);
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
              <div className="flex flex-col items-center justify-center gap-6 text-center" style={{ minHeight: "calc(100vh - 220px)" }}>
                <div className="w-16 h-16 rounded-full border border-[#d1d9e6] flex items-center justify-center">
                  <NotebookPen className="w-6 h-6 text-[#1e2533]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>No check-ins yet</p>
                  <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>
                    Press below to log how you've been feeling.
                  </p>
                </div>
                <button
                  onClick={handleNewCheckIn}
                  className="w-full bg-[#577399] text-white rounded-2xl py-4"
                  style={{ fontSize: 16, fontWeight: 600 }}
                >
                  New check-in
                </button>
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setView("list"); setEditing(false); }}
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
              {!editing && (
                <button
                  onClick={() => handleStartEdit({ overview: selected.overview, feeling: selected.feeling, symptoms: selected.symptoms })}
                  className="flex items-center gap-1.5 bg-[#eaedf4] rounded-full px-3 py-1.5"
                  style={{ fontSize: 12, fontWeight: 600, color: "#394c6b" }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            <CheckInReadEdit label="OVERVIEW" value={editing ? editOverview : selected.overview} editing={editing} onChange={setEditOverview} multiline />
            {(editing || selected.feeling.trim()) && (
              <CheckInReadEdit label="HOW YOU FELT" value={editing ? editFeeling : selected.feeling} editing={editing} onChange={setEditFeeling} multiline />
            )}
            {(editing || selected.symptoms.trim()) && (
              <CheckInReadEdit
                label="SYMPTOMS & CONCERNS"
                value={editing ? editSymptoms : selected.symptoms}
                editing={editing}
                onChange={setEditSymptoms}
                multiline
                tags={editing ? parseSymptomTags(editSymptoms) : (selected.symptomTags ?? parseSymptomTags(selected.symptoms))}
              />
            )}

            <p className="text-center text-[#a9b9d0]" style={{ fontSize: 11 }}>
              Not medical advice. Always follow your care team's guidance.
            </p>

            {editing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-[#eaedf4] text-[#394c6b] rounded-2xl py-3.5"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(selected.id)}
                  className="flex-1 bg-[#577399] text-white rounded-2xl py-3.5"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  Save changes
                </button>
              </div>
            )}
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

            {/* Feeling field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                  HOW HAVE YOU BEEN FEELING LATELY?
                </p>
              </div>
              <div className="relative bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {recordingField === "feeling" ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-4 py-8">
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-[#577399]"
                          animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                    <p className="text-[#577399]" style={{ fontSize: 13, fontWeight: 600 }}>
                      Recording · {formatTimer(recordingSeconds)}
                    </p>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-[#577399] text-white rounded-full px-5 py-2.5 mt-1"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      <Square className="w-3.5 h-3.5 fill-white" strokeWidth={0} />
                      Stop & use recording
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={feeling}
                      onChange={(e) => setFeeling(e.target.value)}
                      placeholder="Describe how you've been feeling in your own words..."
                      rows={5}
                      className="w-full bg-transparent px-4 pt-4 pb-2 text-[#1e2533] outline-none resize-none"
                      style={{ fontSize: 15, lineHeight: "1.6", border: "none" }}
                    />
                    <div className="flex items-center justify-end px-3 pb-3">
                      <button
                        onClick={() => startRecording("feeling")}
                        className="flex items-center gap-1.5 bg-[#eaedf4] rounded-full px-3 py-1.5"
                        style={{ fontSize: 12, fontWeight: 600, color: "#577399" }}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Speak
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Symptoms field */}
            <div className="flex flex-col gap-2">
              <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                ANY PAINS, CONCERNS, OR SYMPTOMS?
              </p>
              <div className="relative bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {recordingField === "symptoms" ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-4 py-8">
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-[#577399]"
                          animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                    <p className="text-[#577399]" style={{ fontSize: 13, fontWeight: 600 }}>
                      Recording · {formatTimer(recordingSeconds)}
                    </p>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-[#577399] text-white rounded-full px-5 py-2.5 mt-1"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      <Square className="w-3.5 h-3.5 fill-white" strokeWidth={0} />
                      Stop & use recording
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="List anything you've noticed — aches, changes, concerns..."
                      rows={5}
                      className="w-full bg-transparent px-4 pt-4 pb-2 text-[#1e2533] outline-none resize-none"
                      style={{ fontSize: 15, lineHeight: "1.6", border: "none" }}
                    />
                    <div className="flex items-center justify-end px-3 pb-3">
                      <button
                        onClick={() => startRecording("symptoms")}
                        className="flex items-center gap-1.5 bg-[#eaedf4] rounded-full px-3 py-1.5"
                        style={{ fontSize: 12, fontWeight: 600, color: "#577399" }}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Speak
                      </button>
                    </div>
                  </>
                )}
              </div>
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
        {view === "result" && (() => {
          const resultEntry = entries[0];
          return (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 pt-2 pb-4">
                <div className="w-16 h-16 rounded-full bg-[#eaedf4] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-[#577399]" />
                </div>
                <div className="text-center">
                  <h2 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 700 }}>Your Overview</h2>
                  <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>
                    Saved · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <CheckInReadEdit
                label="OVERVIEW"
                value={editing ? editOverview : overview}
                editing={editing}
                onChange={setEditOverview}
                multiline
              />
              {(editing || feeling.trim()) && (
                <CheckInReadEdit
                  label="HOW YOU FELT"
                  value={editing ? editFeeling : feeling}
                  editing={editing}
                  onChange={setEditFeeling}
                  multiline
                />
              )}
              {(editing || symptoms.trim()) && (
                <CheckInReadEdit
                  label="SYMPTOMS & CONCERNS"
                  value={editing ? editSymptoms : symptoms}
                  editing={editing}
                  onChange={setEditSymptoms}
                  multiline
                  tags={editing ? parseSymptomTags(editSymptoms) : parseSymptomTags(symptoms)}
                />
              )}

              <p className="text-center text-[#a9b9d0]" style={{ fontSize: 11 }}>
                Not medical advice. Always follow your care team's guidance.
              </p>

              {editing ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-[#eaedf4] text-[#394c6b] rounded-2xl py-3.5"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => resultEntry && handleSaveEdit(resultEntry.id)}
                    className="flex-1 bg-[#577399] text-white rounded-2xl py-3.5"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Save changes
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStartEdit({ overview, feeling, symptoms })}
                    className="flex items-center justify-center gap-2 flex-1 bg-[#eaedf4] text-[#394c6b] rounded-2xl py-3.5"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
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
              )}
            </motion.div>
          );
        })()}

      </AnimatePresence>
    </div>
  );
}

// ── Shared read/edit field ────────────────────────────────
function CheckInReadEdit({
  label,
  value,
  editing,
  onChange,
  multiline,
  tags,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  tags?: string[];
}) {
  const isSymptoms = label === "SYMPTOMS & CONCERNS";

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
      <p className="text-[#577399]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</p>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={multiline ? 4 : 2}
          className="w-full bg-[#f5f7fa] rounded-xl px-3 py-2.5 text-[#1e2533] outline-none resize-none"
          style={{ fontSize: 14, lineHeight: "1.6", border: "none" }}
        />
      ) : isSymptoms && tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-[#eaedf4] rounded-xl px-3 py-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-[#577399] shrink-0" />
              <span className="text-[#1e2533]" style={{ fontSize: 13, fontWeight: 500 }}>{tag}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#394c6b]" style={{ fontSize: label === "OVERVIEW" ? 15 : 14, lineHeight: label === "OVERVIEW" ? "1.65" : "1.6" }}>
          {value}
        </p>
      )}
    </div>
  );
}
