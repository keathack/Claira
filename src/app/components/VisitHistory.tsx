import { ArrowLeft, FileText, Calendar, ChevronRight, Trash2, Flag, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VisitRecord {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  hasDiagnosis: boolean;
  hasMedications: boolean;
  hasNextSteps: boolean;
  diagnosisPreview: string;
}

const VISITS: VisitRecord[] = [
  {
    id: "v1",
    doctor: "Dr. James Park",
    specialty: "General Practice",
    date: "Mar 15, 2026",
    hasDiagnosis: true,
    hasMedications: true,
    hasNextSteps: true,
    diagnosisPreview: "Type 2 diabetes management — A1C at 7.2%. Metformin increased to 1000mg twice daily.",
  },
  {
    id: "v2",
    doctor: "Dr. Sarah Chen",
    specialty: "Cardiology",
    date: "Feb 20, 2026",
    hasDiagnosis: true,
    hasMedications: true,
    hasNextSteps: true,
    diagnosisPreview: "Blood pressure well controlled at 128/82. Continue current Lisinopril 10mg daily.",
  },
  {
    id: "v3",
    doctor: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    date: "Jan 10, 2026",
    hasDiagnosis: true,
    hasMedications: false,
    hasNextSteps: true,
    diagnosisPreview: "Initial consultation for diabetes management. Referred from Dr. Park for specialist care.",
  },
];

interface VisitHistoryProps {
  onBack: () => void;
  onViewSummary: (id: string) => void;
}

export function VisitHistory({ onBack, onViewSummary }: VisitHistoryProps) {
  const [visits, setVisits] = useState(VISITS);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== id));
    setDeleteConfirmId(null);
  };

  const isEmpty = visits.length === 0;

  return (
    <div className="px-5 pt-14 pb-4 min-h-screen" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white border border-[#d1d9e6] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#32415a]" />
        </button>
        <div className="flex-1">
          <h1 className="text-[#1e2533]" style={{ fontSize: 20, fontWeight: 600 }}>Visit History</h1>
          <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{visits.length} past summaries</p>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#577399]/8 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#577399]" />
          </div>
          <p className="text-[#1e2533] mb-1" style={{ fontSize: 16, fontWeight: 600 }}>No visit summaries yet</p>
          <p className="text-[#a9b9d0] max-w-[260px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
            After you record and summarize a doctor visit, it will appear here for future reference.
          </p>
        </div>
      )}

      {/* Visit List */}
      <div className="space-y-3">
        {visits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-2xl border border-[#d1d9e6] overflow-hidden relative">
            {/* Delete Confirmation */}
            <AnimatePresence>
              {deleteConfirmId === visit.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center gap-3 z-10 p-4"
                >
                  <p className="text-[#1e2533] text-center" style={{ fontSize: 14, fontWeight: 500 }}>Delete this visit summary?</p>
                  <p className="text-[#a9b9d0] text-center" style={{ fontSize: 12 }}>This cannot be undone.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2 rounded-xl border border-[#d1d9e6] text-[#32415a]" style={{ fontSize: 13 }}>
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(visit.id)} className="px-5 py-2 rounded-xl bg-[#d4183d] text-white" style={{ fontSize: 13 }}>
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => onViewSummary(visit.id)} className="w-full p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[#a9b9d0]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span style={{ fontSize: 12 }}>{visit.date}</span>
                </div>
              </div>
              <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>{visit.doctor}</p>
              <p className="text-[#7a94b6] mt-0.5" style={{ fontSize: 13 }}>{visit.specialty}</p>
              <p className="text-[#a9b9d0] mt-2" style={{ fontSize: 13, lineHeight: 1.5 }}>{visit.diagnosisPreview}</p>

              {/* Section indicators */}
              <div className="flex gap-2 mt-3">
                {visit.hasDiagnosis && <span className="px-2 py-0.5 rounded bg-[#577399]/10 text-[#577399]" style={{ fontSize: 10, fontWeight: 500 }}>Diagnosis</span>}
                {visit.hasMedications && <span className="px-2 py-0.5 rounded bg-[#465e83]/10 text-[#465e83]" style={{ fontSize: 10, fontWeight: 500 }}>Medications</span>}
                {visit.hasNextSteps && <span className="px-2 py-0.5 rounded bg-[#d4183d]/10 text-[#d4183d]" style={{ fontSize: 10, fontWeight: 500 }}>Next Steps</span>}
              </div>
            </button>

            {/* Footer Actions */}
            <div className="flex border-t border-[#eaedf4]">
              <button className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[#a9b9d0] hover:bg-[#f5f7fa]" style={{ fontSize: 12 }}>
                <Flag className="w-3 h-3" /> Report Issue
              </button>
              <div className="w-px bg-[#eaedf4]" />
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(visit.id); }}
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[#a9b9d0] hover:bg-[#f5f7fa]"
                style={{ fontSize: 12 }}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {!isEmpty && (
        <div className="bg-[#eaedf4] rounded-2xl p-3 mt-5">
          <p className="text-[#7a94b6] text-center" style={{ fontSize: 11, lineHeight: 1.5 }}>
            These summaries reflect what your doctor shared during your visits. They are not medical advice.
          </p>
        </div>
      )}
    </div>
  );
}
