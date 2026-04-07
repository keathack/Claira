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
import { loadVisits } from "./components/Visits";

// Seed the Dr. Patel visit for the presentation if no visits exist
const SEED_KEY = "claira_seeded_v1";
if (!localStorage.getItem(SEED_KEY) && loadVisits().length === 0) {
  const seedVisit = {
    id: "seed-patel-001",
    date: "2026-04-06T10:30:00.000Z",
    summary: {
      conditionName: "Type 2 Diabetes",
      diagnosis: "Your blood test, called a hemoglobin A1C, came back at 8.1%, which means your blood sugar levels have been higher than they should be over the past few months. This means you have Type 2 Diabetes — a condition where your body has trouble managing sugar in your blood. The good news is this is very manageable. With the right medication and some lifestyle adjustments, many people with Type 2 Diabetes live completely normal lives.\n\nTo help keep your levels in check day to day, try to check your blood sugar every morning before eating and keep a log of your readings to bring to your next visit. A 15–20 minute walk after dinner each evening can also make a real difference. If your blood sugar ever goes above 250, or you feel dizzy, very thirsty, or unusually tired, contact Dr. Patel right away.",
      medications: [
        {
          name: "Metformin",
          whatItDoes: "Helps lower your blood sugar levels to better manage your Type 2 Diabetes.",
          howToTake: "Take 500 mg twice a day — once in the morning and once in the evening, both times with food.",
          sideEffects: "You might experience some stomach upset, nausea, or diarrhea when first starting. Taking it with food can help. Let your doctor know if these issues last more than one to two weeks. In rare cases it can cause a condition called lactic acidosis — contact your doctor right away if you feel unusual muscle pain or have trouble breathing.",
        },
      ],
      nextSteps: [
        { title: "Pick up your Metformin", description: "Head to your pharmacy to pick up your Metformin prescription. Remember to always take it with food." },
        { title: "Get a blood glucose monitor", description: "Purchase a blood glucose monitor so you can track your levels at home every morning. Ask your pharmacist if you need help choosing one." },
        { title: "Check your insurance coverage", description: "Call your insurance provider to confirm what is covered for testing strips and diabetes supplies." },
        { title: "Book an appointment with a dietitian", description: "Ask the front desk to get a referral to a registered dietitian who specializes in diabetes management." },
        { title: "Schedule your follow-up", description: "Book your next appointment with Dr. Patel for 3 months from today to recheck your A1C." },
      ],
    },
  };
  localStorage.setItem("claira_visits", JSON.stringify([seedVisit]));
  localStorage.setItem(SEED_KEY, "1");
}

const FULL_SCREEN_ROUTES = ["/summary", "/symptoms", "/visit-prep", "/nextsteps", "/medications"];

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
      case "/history": return <Visits onNewVisit={() => setCurrentPath("/summary")} />;
      case "/nextsteps": {
        const lastVisit = loadVisits()[0] ?? undefined;
        return <VisitSummary onBack={() => setCurrentPath("/")} savedVisit={lastVisit} initialTab="Next Steps" />;
      }
      case "/medications": {
        const lastVisit = loadVisits()[0] ?? undefined;
        return <VisitSummary onBack={() => setCurrentPath("/")} savedVisit={lastVisit} initialTab="Medications" />;
      }
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
