import { Pill, Clock, AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

const medications = [
  { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "8:00 AM", remaining: 22, category: "Blood Pressure" },
  { id: 2, name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "8AM / 6PM", remaining: 8, category: "Diabetes" },
  { id: 3, name: "Aspirin", dosage: "81mg", frequency: "Once daily", time: "8:00 PM", remaining: 45, category: "Heart" },
  { id: 4, name: "Vitamin D3", dosage: "2000 IU", frequency: "Once daily", time: "8:00 AM", remaining: 60, category: "Supplement" },
  { id: 5, name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", time: "9:00 PM", remaining: 18, category: "Cholesterol" },
];

export function Medications() {
  return (
    <div className="px-5 pt-14 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 600 }}>Medications</h1>
        <button className="w-10 h-10 rounded-xl bg-[#577399] flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", value: "5", icon: Pill, color: "#577399" },
          { label: "Next Dose", value: "12 PM", icon: Clock, color: "#465e83" },
          { label: "Refill", value: "1", icon: AlertCircle, color: "#d4183d" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-[#d1d9e6] text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-[#1e2533]" style={{ fontSize: 18, fontWeight: 600 }}>{s.value}</p>
            <p className="text-[#a9b9d0]" style={{ fontSize: 11 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {medications.map((med) => (
          <div key={med.id} className="bg-white rounded-2xl p-4 border border-[#d1d9e6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#577399]/10 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-[#577399]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[#1e2533]" style={{ fontSize: 15, fontWeight: 500 }}>{med.name}</p>
                  <span className={`px-2 py-0.5 rounded-md ${med.remaining <= 10 ? "bg-[#d4183d]/10 text-[#d4183d]" : "bg-[#577399]/10 text-[#577399]"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                    {med.remaining} left
                  </span>
                </div>
                <p className="text-[#a9b9d0] mt-0.5" style={{ fontSize: 13 }}>{med.dosage} · {med.frequency}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[#7a94b6]">
                  <Clock className="w-3 h-3" />
                  <span style={{ fontSize: 12 }}>{med.time}</span>
                  <span className="text-[#d1d9e6] mx-1">·</span>
                  <span style={{ fontSize: 12 }}>{med.category}</span>
                </div>
              </div>
            </div>
            {med.remaining <= 10 && (
              <button className="mt-3 w-full py-2 rounded-xl border border-[#d4183d]/20 text-[#d4183d] flex items-center justify-center gap-2" style={{ fontSize: 13, fontWeight: 500 }}>
                <RefreshCw className="w-3.5 h-3.5" /> Request Refill
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
