import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Visits } from "./components/Visits";
import { CheckIn } from "./components/CheckIn";
import { MorePage } from "./components/MorePage";
import { VisitSummary } from "./components/VisitSummary";
import { SymptomLog } from "./components/SymptomLog";
import { VisitPrep } from "./components/VisitPrep";
import { VisitHistory } from "./components/VisitHistory";

const FULL_SCREEN_ROUTES = ["/summary", "/symptoms", "/visit-prep", "/history"];

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  if (!onboarded) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex justify-center" style={{ fontFamily: "'Area Normal', sans-serif" }}>
        <div className="w-full max-w-[430px] relative bg-[#f5f7fa] min-h-screen">
          <Onboarding onComplete={() => setOnboarded(true)} />
        </div>
      </div>
    );
  }

  const isFullScreen = FULL_SCREEN_ROUTES.includes(currentPath);

  const renderPage = () => {
    switch (currentPath) {
      case "/visits": return <Visits onNewVisit={() => setCurrentPath("/summary")} />;
      case "/checkin": return <CheckIn onBack={() => setCurrentPath("/")} />;
      case "/more": return <MorePage onNavigate={setCurrentPath} />;
      case "/summary": return <VisitSummary onBack={() => setCurrentPath("/")} />;
      case "/symptoms": return <SymptomLog onBack={() => setCurrentPath("/")} />;
      case "/visit-prep": return <VisitPrep onBack={() => setCurrentPath("/")} onNavigate={setCurrentPath} />;
      case "/history": return <VisitHistory onBack={() => setCurrentPath("/")} onViewSummary={() => setCurrentPath("/summary")} />;
      default: return <Dashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex justify-center" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      <div className="w-full max-w-[430px] relative bg-[#f5f7fa] min-h-screen">
        <div className={isFullScreen ? "pb-8" : "pb-24"} style={{ overflowY: "auto" }}>
          {renderPage()}
        </div>
        {!isFullScreen && <BottomNav currentPath={currentPath} onNavigate={setCurrentPath} />}
      </div>
    </div>
  );
}
