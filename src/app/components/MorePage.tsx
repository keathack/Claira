import { FileText, Bell, Shield, User, ChevronRight, Settings, HelpCircle, LogOut, ClipboardList, Stethoscope, History } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const PATIENT_IMG = "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBhdGllbnQlMjBoZWFsdGhjYXJlJTIwc21pbGluZ3xlbnwxfHx8fDE3NzQ4MDg5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface MorePageProps {
  onNavigate: (path: string) => void;
}

const features = [
  { icon: ClipboardList, label: "Symptom Log", desc: "Track symptoms between visits", path: "/symptoms" },
  { icon: Stethoscope, label: "Visit Prep", desc: "Prepare for your next appointment", path: "/visit-prep" },
  { icon: History, label: "Visit History", desc: "Past visit summaries", path: "/history" },
  { icon: FileText, label: "Medical Records", desc: "Lab reports, imaging, documents", path: "" },
];

const settings = [
  { icon: User, label: "Profile", desc: "Personal info, emergency contacts" },
  { icon: Bell, label: "Notifications", desc: "Medication & appointment alerts" },
  { icon: Shield, label: "Privacy & Security", desc: "Data sharing, permissions" },
  { icon: Settings, label: "Settings", desc: "Preferences, display" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us" },
];

export function MorePage({ onNavigate }: MorePageProps) {
  return (
    <div className="px-5 pt-14 pb-4 space-y-5" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      <h1 className="text-[#1e2533]" style={{ fontSize: 22, fontWeight: 600 }}>More</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#d1d9e6] flex items-center gap-4">
        <ImageWithFallback src={PATIENT_IMG} alt="Profile" className="w-14 h-14 rounded-2xl object-cover" />
        <div className="flex-1">
          <p className="text-[#1e2533]" style={{ fontSize: 16, fontWeight: 600 }}>Alex Johnson</p>
          <p className="text-[#a9b9d0]" style={{ fontSize: 13 }}>ID: CL-29384</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#a9b9d0]" />
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-[#d1d9e6] overflow-hidden">
        {features.map((s, i) => (
          <button
            key={s.label}
            onClick={() => s.path && onNavigate(s.path)}
            className={`w-full flex items-center gap-4 px-4 py-4 text-left ${i < features.length - 1 ? "border-b border-[#eaedf4]" : ""} active:bg-[#f5f7fa]`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#577399]/8 flex items-center justify-center shrink-0">
              <s.icon className="w-4 h-4 text-[#577399]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</p>
              <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{s.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#a9b9d0] shrink-0" />
          </button>
        ))}
      </div>

      {/* Settings */}
      <p className="text-[#a9b9d0] px-1" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Settings</p>
      <div className="bg-white rounded-2xl border border-[#d1d9e6] overflow-hidden">
        {settings.map((s, i) => (
          <button key={s.label} className={`w-full flex items-center gap-4 px-4 py-4 text-left ${i < settings.length - 1 ? "border-b border-[#eaedf4]" : ""} active:bg-[#f5f7fa]`}>
            <div className="w-9 h-9 rounded-xl bg-[#eaedf4] flex items-center justify-center shrink-0">
              <s.icon className="w-4 h-4 text-[#7a94b6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1e2533]" style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</p>
              <p className="text-[#a9b9d0]" style={{ fontSize: 12 }}>{s.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#a9b9d0] shrink-0" />
          </button>
        ))}
      </div>

      <button className="w-full py-3 rounded-2xl border border-[#d4183d]/20 text-[#d4183d] flex items-center justify-center gap-2" style={{ fontSize: 14, fontWeight: 500 }}>
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
