import { Home, ClipboardList, Activity, Bell, Mic } from "lucide-react";

const leftTabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: ClipboardList, label: "Visits", path: "/visits" },
];

const rightTabs = [
  { icon: Activity, label: "Vitals", path: "/vitals" },
  { icon: Bell, label: "More", path: "/more" },
];

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BottomNav({ currentPath, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-border z-50 px-2 pb-5 pt-2">
      <div className="flex items-center justify-around">
        {leftTabs.map((tab) => {
          const active = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-[#577399]" : "text-[#a9b9d0]"
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}

        {/* Center Record button */}
        <button
          onClick={() => onNavigate("/summary")}
          className="w-14 h-14 rounded-full bg-[#577399] flex items-center justify-center"
          style={{ boxShadow: "0 4px 20px rgba(87,115,153,0.45)" }}
        >
          <Mic className="w-6 h-6 text-white" />
        </button>

        {rightTabs.map((tab) => {
          const active = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-[#577399]" : "text-[#a9b9d0]"
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
