import { useState } from "react";
import { ArrowLeft, Plus, Edit3, Trash2, X, Check, AlertCircle, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SymptomEntry {
  id: string;
  date: string;
  time: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes: string;
  visitId?: string;
}

const SEVERITY_LABELS = ["", "Mild", "Slight", "Moderate", "Strong", "Severe"];
const SEVERITY_COLORS = ["", "#577399", "#7a94b6", "#e6a817", "#d4813d", "#d4183d"];

const INITIAL_ENTRIES: SymptomEntry[] = [
  { id: "1", date: "Mar 29, 2026", time: "8:30 AM", symptom: "Nausea", severity: 2, notes: "Mild nausea after taking Metformin. Went away after eating.", visitId: "v1" },
  { id: "2", date: "Mar 28, 2026", time: "3:00 PM", symptom: "Dizziness", severity: 3, notes: "Felt lightheaded when standing up quickly. Lasted about 10 minutes." },
  { id: "3", date: "Mar 27, 2026", time: "9:00 PM", symptom: "Fatigue", severity: 2, notes: "Unusually tired in the evening." },
];

const COMMON_SYMPTOMS = ["Nausea", "Dizziness", "Headache", "Fatigue", "Stomach pain", "Diarrhea", "Muscle ache", "Insomnia", "Other"];

interface SymptomLogProps {
  onBack: () => void;
}

export function SymptomLog({ onBack }: SymptomLogProps) {
  const [entries, setEntries] = useState<SymptomEntry[]>(INITIAL_ENTRIES);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Form state
  const [formSymptom, setFormSymptom] = useState("");
  const [formSeverity, setFormSeverity] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [formNotes, setFormNotes] = useState("");

  const resetForm = () => {
    setFormSymptom("");
    setFormSeverity(2);
    setFormNotes("");
    setShowAdd(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formSymptom.trim()) return;
    setSaveStatus("saving");

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

      if (editingId) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingId ? { ...e, symptom: formSymptom, severity: formSeverity, notes: formNotes } : e
          )
        );
      } else {
        const newEntry: SymptomEntry = {
          id: Date.now().toString(),
          date: dateStr,
          time: timeStr,
          symptom: formSymptom,
          severity: formSeverity,
          notes: formNotes,
        };
        setEntries((prev) => [newEntry, ...prev]);
      }
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
        resetForm();
      }, 1000);
    }, 800);
  };

  const handleEdit = (entry: SymptomEntry) => {
    setFormSymptom(entry.symptom);
    setFormSeverity(entry.severity);
    setFormNotes(entry.notes);
    setEditingId(entry.id);
    setShowAdd(true);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
  };

  const isEmpty = entries.length === 0 && !showAdd;

  return (
    <div className="px-5 pt-14 pb-4 min-h-screen" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white border border-[#d1d9e6] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#32415a]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[#1e2533]" style={{ fontSize: 20, fontWeight: 600 }}>Symptom Log</h1>
          <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>Track how you feel between visits</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl bg-[#577399] flex items-center justify-center"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-white rounded-2xl border border-[#d1d9e6] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 600 }}>
                  {editingId ? "Edit Entry" : "New Entry"}
                </p>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-[#f5f7fa] flex items-center justify-center">
                  <X className="w-4 h-4 text-[#a9b9d0]" />
                </button>
              </div>

              {/* Symptom Picker */}
              <div>
                <label className="text-[#7a94b6] block mb-2" style={{ fontSize: 12, fontWeight: 600 }}>SYMPTOM</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormSymptom(s)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        formSymptom === s
                          ? "bg-[#577399] text-white"
                          : "bg-[#f5f7fa] text-[#32415a] border border-[#eaedf4]"
                      }`}
                      style={{ fontSize: 13 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-[#7a94b6] block mb-2" style={{ fontSize: 12, fontWeight: 600 }}>
                  SEVERITY — {SEVERITY_LABELS[formSeverity]}
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setFormSeverity(n)}
                      className={`flex-1 py-2.5 rounded-xl transition-all ${
                        formSeverity === n ? "text-white" : "bg-[#f5f7fa] text-[#7a94b6]"
                      }`}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: formSeverity === n ? SEVERITY_COLORS[n] : undefined,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[#7a94b6] block mb-2" style={{ fontSize: 12, fontWeight: 600 }}>NOTES (OPTIONAL)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="How did it feel? When did it start?"
                  className="w-full bg-[#f5f7fa] rounded-xl p-3 text-[#1e2533] placeholder:text-[#a9b9d0] outline-none resize-none"
                  style={{ fontSize: 14, minHeight: 80, lineHeight: 1.6 }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!formSymptom.trim() || saveStatus === "saving"}
                className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  !formSymptom.trim()
                    ? "bg-[#eaedf4] text-[#a9b9d0]"
                    : saveStatus === "saved"
                    ? "bg-green-500 text-white"
                    : "bg-[#577399] text-white"
                }`}
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                {saveStatus === "saving" ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <Check className="w-4 h-4" /> Saved
                  </>
                ) : (
                  <>
                    {editingId ? "Update Entry" : "Log Symptom"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#577399]/8 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-[#577399]" />
          </div>
          <p className="text-[#1e2533] mb-1" style={{ fontSize: 16, fontWeight: 600 }}>No entries yet</p>
          <p className="text-[#a9b9d0] mb-6 max-w-[260px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Start logging how you feel between visits. Your entries will help you prepare for your next appointment.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-[#577399] text-white px-6 py-3 rounded-2xl flex items-center gap-2"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" /> Log Your First Symptom
          </button>
        </div>
      )}

      {/* Entries List */}
      {!isEmpty && !showAdd && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-[#d1d9e6] p-4 relative">
              {/* Delete Confirmation Overlay */}
              <AnimatePresence>
                {deleteConfirmId === entry.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center gap-3 z-10 p-4"
                  >
                    <p className="text-[#1e2533] text-center" style={{ fontSize: 14, fontWeight: 500 }}>Delete this entry?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-5 py-2 rounded-xl border border-[#d1d9e6] text-[#32415a]"
                        style={{ fontSize: 13 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-5 py-2 rounded-xl bg-[#d4183d] text-white"
                        style={{ fontSize: 13 }}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: SEVERITY_COLORS[entry.severity] + "14" }}
                >
                  <span style={{ color: SEVERITY_COLORS[entry.severity], fontSize: 14, fontWeight: 700 }}>{entry.severity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>{entry.symptom}</p>
                    <span
                      className="px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: SEVERITY_COLORS[entry.severity] + "16", color: SEVERITY_COLORS[entry.severity], fontSize: 11, fontWeight: 500 }}
                    >
                      {SEVERITY_LABELS[entry.severity]}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-[#7a94b6] mt-1" style={{ fontSize: 13, lineHeight: 1.5 }}>{entry.notes}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-[#a9b9d0]">
                    <Clock className="w-3 h-3" />
                    <span style={{ fontSize: 12 }}>{entry.date} · {entry.time}</span>
                    {entry.visitId && (
                      <span className="ml-1 px-2 py-0.5 rounded bg-[#577399]/8 text-[#577399]" style={{ fontSize: 10 }}>Linked to visit</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(entry)} className="w-8 h-8 rounded-lg hover:bg-[#f5f7fa] flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5 text-[#a9b9d0]" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(entry.id)} className="w-8 h-8 rounded-lg hover:bg-[#f5f7fa] flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-[#a9b9d0]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
