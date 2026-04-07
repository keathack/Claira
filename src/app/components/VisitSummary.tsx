import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Mic, MicOff, FileText, Check, ChevronDown, ChevronUp, AlertCircle, Clipboard, Share2, Play, Pause, Square, WifiOff, RotateCcw, Trash2, BookmarkCheck, Bookmark, FileAudio, ChevronRight, ClipboardList, ScanText, Pill } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveVisit } from "./Visits";

interface SummaryData {
  conditionName?: string;
  diagnosis: string;
  medications: { name: string; whatItDoes: string; howToTake: string; sideEffects: string }[];
  nextSteps: { title: string; description: string }[];
}

const MOCK_TRANSCRIPT = `So your fasting blood sugar came back at 238, and your A1C — which is basically a measure of your average blood sugar over the past three months — that came back at 8.1%. Both of those numbers are elevated, and based on these results I am diagnosing you with Type 2 Diabetes. It means your body isn't processing sugar the way it should. Your pancreas is still producing insulin, but your cells aren't responding to it effectively. The important thing I want you to hear is that this is very manageable. I'm going to start you on a medication called Metformin. We'll start you at 500 milligrams twice a day — once with breakfast and once with dinner. Taking it with food is important, it helps reduce the side effects. The most common ones are digestive — nausea, an upset stomach, sometimes diarrhea, especially in the first couple of weeks. There is a rare but more serious side effect called lactic acidosis, which can cause unusual muscle pain or difficulty breathing — if you ever experience that, contact me right away or go to the ER. I want you to monitor your blood sugar at home every morning before you eat and keep a log of those readings. I'd also like to refer you to a registered dietitian who specializes in diabetes management. Even something as simple as a 15 to 20 minute walk after dinner each evening can make a real difference. I want to see you back here in three months to check your A1C again. If your blood sugar ever exceeds 250, or you feel dizzy, very thirsty, or unusually tired, don't wait — call us right away.`;

const MOCK_SUMMARY: SummaryData = {
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
};

type MicPermission = "prompt" | "granted" | "denied";
type RecordingState = "idle" | "recording" | "paused";
type ProcessingState = "idle" | "processing" | "slow" | "success" | "error-network" | "error-inaudible" | "error-too-short";

interface VisitSummaryProps {
  onBack: () => void;
  savedVisit?: { date: string; summary: SummaryData };
  initialTab?: "Diagnosis" | "Medications" | "Next Steps";
}

function DiagnosisContent({ text, conditionName }: { text: string; conditionName?: string }) {
  const [overview, management] = text.split("\n\n");
  const alertMarker = ". If your blood sugar";
  const alertIdx = management?.indexOf(alertMarker) ?? -1;
  const dayToDay = alertIdx !== -1 ? management.slice(0, alertIdx + 1) : management;
  const alertText = alertIdx !== -1 ? "If your blood sugar" + management.slice(alertIdx + alertMarker.length) : null;

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="space-y-1.5">
        {conditionName && (
          <p className="text-kashmir-blue-950" style={{ fontSize: 20, fontWeight: 700 }}>{conditionName}</p>
        )}
        <p className="text-kashmir-blue-800" style={{ fontSize: 15, lineHeight: 1.85 }}>{overview}</p>
      </div>

      {/* Day to Day */}
      {dayToDay && (
        <div className="space-y-1.5">
          <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Day to Day</p>
          <p className="text-kashmir-blue-800" style={{ fontSize: 15, lineHeight: 1.85 }}>{dayToDay}</p>
        </div>
      )}

      {/* When to Call card */}
      {alertText && (
        <div className="bg-kashmir-blue-500/10 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-kashmir-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-kashmir-blue-500" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>When to Call</p>
            <p className="text-kashmir-blue-800 mt-1" style={{ fontSize: 14, lineHeight: 1.7 }}>{alertText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const MAX_RECORDING_SECONDS = 1800; // 30 min

export function VisitSummary({ onBack, savedVisit, initialTab }: VisitSummaryProps) {
  const [step, setStep] = useState<"input" | "loading" | "result">(savedVisit ? "result" : "input");
  const [transcript, setTranscript] = useState("");
  const [micPermission, setMicPermission] = useState<MicPermission>("prompt");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [summary, setSummary] = useState<SummaryData | null>(savedVisit?.summary ?? null);
  const [expandedSection, setExpandedSection] = useState<string | null>("diagnosis");
  const [activeTab, setActiveTab] = useState<"Diagnosis" | "Medications" | "Next Steps">(initialTab ?? "Diagnosis");
  const [copied, setCopied] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [doubleGuard, setDoubleGuard] = useState(false);
  const waveHeights = useMemo(() => Array.from({ length: 30 }, () => Math.random() * 28 + 4), []);

  // Timer for recording
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recordingState]);

  const requestMicPermission = useCallback(() => {
    // Simulate permission request
    setTimeout(() => {
      setMicPermission("granted");
    }, 500);
  }, []);

  const startRecording = () => {
    if (doubleGuard) return;
    setDoubleGuard(true);
    setTimeout(() => setDoubleGuard(false), 500);

    if (micPermission === "denied") return;

    if (micPermission === "prompt") {
      // Request permission then start immediately
      setTimeout(() => {
        setMicPermission("granted");
        setRecordingState("recording");
        setRecordingSeconds(0);
      }, 500);
      return;
    }

    setRecordingState("recording");
    setRecordingSeconds(0);
  };

  const pauseRecording = () => {
    setRecordingState("paused");
  };

  const resumeRecording = () => {
    setRecordingState("recording");
  };

  const stopRecording = () => {
    setRecordingState("idle");
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordingSeconds >= 5 || transcript) {
      setTranscript(MOCK_TRANSCRIPT);
    }
  };

  const stopAndSummarize = () => {
    setRecordingState("idle");
    if (timerRef.current) clearInterval(timerRef.current);
    const finalTranscript = MOCK_TRANSCRIPT;
    setTranscript(finalTranscript);
    setStep("loading");
    setProcessingState("processing");
    processingTimerRef.current = setTimeout(() => setProcessingState("slow"), 3000);
    setTimeout(() => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      setProcessingState("success");
      setSummary(MOCK_SUMMARY);
      setStep("result");
      setExpandedSection("diagnosis");
      setActiveTab("Diagnosis");
    }, 5000);
  };

  const handleDiscardRecording = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    setRecordingState("idle");
    setRecordingSeconds(0);
    setTranscript("");
    setShowDiscardConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePasteExample = () => {
    setTranscript(MOCK_TRANSCRIPT);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSummarize = () => {
    if (!transcript.trim() || doubleGuard) return;
    setDoubleGuard(true);
    setTimeout(() => setDoubleGuard(false), 1000);

    // Check too short
    const wordCount = transcript.trim().split(/\s+/).length;
    if (wordCount < 10) {
      setStep("loading");
      setProcessingState("processing");
      setTimeout(() => {
        setProcessingState("error-too-short");
      }, 1500);
      return;
    }

    setStep("loading");
    setProcessingState("processing");

    // Show "slow" state at 3s
    processingTimerRef.current = setTimeout(() => {
      setProcessingState("slow");
    }, 3000);

    // Resolve successfully at 5s
    setTimeout(() => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      setProcessingState("success");
      setSummary(MOCK_SUMMARY);
      setStep("result");
      setExpandedSection("diagnosis");
      setActiveTab("Diagnosis");
    }, 5000);
  };

  const handleSimulateError = (type: "network" | "inaudible") => {
    setStep("loading");
    setProcessingState("processing");
    setTimeout(() => {
      setProcessingState(type === "network" ? "error-network" : "error-inaudible");
    }, 1500);
  };

  const handleRetry = () => {
    setProcessingState("idle");
    setStep("input");
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `YOUR DIAGNOSIS\n${summary.diagnosis}\n\nYOUR MEDICATIONS\n${summary.medications.map((m) => `${m.name}\n- What it does: ${m.whatItDoes}\n- How to take it: ${m.howToTake}\n- Side effects: ${m.sideEffects}`).join("\n\n")}\n\nYOUR NEXT STEPS\n${summary.nextSteps.map((s) => `- ${s}`).join("\n")}\n\nThis summary reflects what your doctor shared during your visit. It is not medical advice. Always follow your care team's guidance, and contact your doctor if you have questions or concerns.`;
    if (navigator.share) {
      navigator.share({ title: "Visit Summary", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Shared step state with home page
  const NEXT_STEPS_KEY = "claira_next_steps";
  const visitId = savedVisit?.id ?? null;
  const [stepState, setStepState] = useState<{ currentIndex: number; completedIndices: number[] }>(() => {
    if (!savedVisit?.id) return { currentIndex: 0, completedIndices: [] };
    try {
      const raw = localStorage.getItem(NEXT_STEPS_KEY);
      const all = raw ? JSON.parse(raw) : {};
      return all[savedVisit.id] ?? { currentIndex: 0, completedIndices: [] };
    } catch { return { currentIndex: 0, completedIndices: [] }; }
  });

  function handleToggleStep(i: number) {
    if (!visitId) return;
    const isCompleted = stepState.completedIndices.includes(i);
    const newCompleted = isCompleted
      ? stepState.completedIndices.filter((x) => x !== i)
      : [...stepState.completedIndices, i];
    const newState = { currentIndex: stepState.currentIndex, completedIndices: newCompleted };
    setStepState(newState);
    try {
      const raw = localStorage.getItem(NEXT_STEPS_KEY);
      const all = raw ? JSON.parse(raw) : {};
      localStorage.setItem(NEXT_STEPS_KEY, JSON.stringify({ ...all, [visitId]: newState }));
    } catch {}
  }

  const handleSave = () => {
    if (!summary || saved) return;
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    if (!summary) return;
    saveVisit(summary);
    setSaved(true);
    setShowSaveConfirm(false);
  };

  const handleReset = () => {
    setStep("input");
    setTranscript("");
    setSummary(null);
    setProcessingState("idle");
    setSaved(false);
    setShowPasteArea(false);
  };

  const handleBack = () => {
    if (recordingState !== "idle") {
      handleDiscardRecording();
    } else if (step === "loading") {
      // Allow leaving during processing
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      setProcessingState("idle");
      setStep("input");
    } else {
      onBack();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={`min-h-screen ${step === "result" ? "" : "px-5 pt-14 pb-4"}`} style={{ fontFamily: "'Area Normal', sans-serif" }}>
      {/* Discard Confirmation Modal */}
      <AnimatePresence>
        {showDiscardConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-t-3xl w-full max-w-[430px] p-5 pb-8"
            >
              <div className="w-10 h-1 bg-kashmir-blue-200 rounded-full mx-auto mb-5" />
              <p className="text-kashmir-blue-950 text-center mb-1" style={{ fontSize: 17, fontWeight: 600 }}>Discard recording?</p>
              <p className="text-kashmir-blue-300 text-center mb-5" style={{ fontSize: 14 }}>This recording hasn't been processed yet and will be lost.</p>
              <div className="space-y-2">
                <button onClick={confirmDiscard} className="w-full py-3.5 rounded-2xl bg-[#d4183d] text-white" style={{ fontSize: 15, fontWeight: 600 }}>
                  Discard
                </button>
                <button onClick={() => setShowDiscardConfirm(false)} className="w-full py-3.5 rounded-2xl border border-kashmir-blue-200 text-kashmir-blue-800" style={{ fontSize: 15, fontWeight: 500 }}>
                  Keep Recording
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — hidden on result step (result has its own hero header) */}
      {step !== "result" && (
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="w-9 h-9 rounded-xl bg-white border border-kashmir-blue-200 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-kashmir-blue-800" />
          </button>
          <div className="flex-1">
            <h1 className="text-kashmir-blue-950" style={{ fontSize: 20, fontWeight: 600 }}>Visit Summary</h1>
            <p className="text-kashmir-blue-300" style={{ fontSize: 12 }}>AI-powered plain language breakdown</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-kashmir-blue-500/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-kashmir-blue-500" />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ======================== INPUT STEP ======================== */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Mic Permission Denied Banner */}
            {micPermission === "denied" && (
              <div className="bg-[#d4183d]/6 rounded-2xl p-4 flex gap-3 mb-4">
                <MicOff className="w-4 h-4 text-[#d4183d] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[#d4183d]" style={{ fontSize: 13, fontWeight: 500 }}>Microphone access denied</p>
                  <p className="text-kashmir-blue-400 mt-0.5" style={{ fontSize: 12 }}>Go to your device settings to enable microphone access, or paste your transcript below.</p>
                </div>
              </div>
            )}

            {/* Recording Active UI */}
            {recordingState !== "idle" && (
              <div className="flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  {/* Timer */}
                  <div className="text-center">
                    <p className="text-kashmir-blue-950" style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(recordingSeconds)}
                    </p>
                    <p className={`mt-1 ${recordingState === "recording" ? "text-[#d4183d]" : "text-kashmir-blue-300"}`} style={{ fontSize: 13, fontWeight: 500 }}>
                      {recordingState === "recording" ? "Recording..." : "Paused"}
                    </p>
                    {recordingSeconds >= MAX_RECORDING_SECONDS - 60 && (
                      <p className="text-[#d4183d] mt-1" style={{ fontSize: 12 }}>Maximum recording time approaching</p>
                    )}
                  </div>

                  {/* Waveform */}
                  <div className="flex items-center justify-center gap-0.5 h-12">
                    {waveHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-kashmir-blue-500"
                        animate={recordingState === "recording" ? { height: [4, h, 4] } : { height: 4 }}
                        transition={recordingState === "recording" ? {
                          repeat: Infinity,
                          duration: 0.6 + (i % 5) * 0.12,
                          delay: i * 0.03,
                        } : {}}
                        style={{ height: 4 }}
                      />
                    ))}
                  </div>

                  {/* Stop button */}
                  <button
                    onClick={stopAndSummarize}
                    className="w-20 h-20 rounded-full bg-kashmir-blue-500 flex items-center justify-center active:scale-95 transition-transform"
                    style={{ boxShadow: "0 4px 20px rgba(87,115,153,0.35)" }}
                  >
                    <Square className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>

                {/* Discard — bottom */}
                <div className="pb-4 flex justify-center">
                  <button onClick={handleDiscardRecording} className="flex items-center gap-2 text-kashmir-blue-300" style={{ fontSize: 13 }}>
                    <Trash2 className="w-4 h-4" />
                    Discard recording
                  </button>
                </div>
              </div>
            )}

            {/* Hero + Secondary options (idle) */}
            {recordingState === "idle" && (
              <div className="flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
                {/* Hero Record Button — vertically centered */}
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <div className="relative flex items-center justify-center">
                    {/* Pulse rings */}
                    {micPermission !== "denied" && (
                      <>
                        <motion.div
                          className="absolute rounded-full bg-kashmir-blue-500/10"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                          style={{ width: 120, height: 120 }}
                        />
                        <motion.div
                          className="absolute rounded-full bg-kashmir-blue-500/8"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.4 }}
                          style={{ width: 120, height: 120 }}
                        />
                      </>
                    )}
                    <button
                      onClick={startRecording}
                      disabled={micPermission === "denied"}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                        micPermission === "denied" ? "bg-kashmir-blue-100" : "bg-kashmir-blue-500"
                      }`}
                    >
                      <Mic className={`w-10 h-10 ${micPermission === "denied" ? "text-kashmir-blue-300" : "text-white"}`} />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-kashmir-blue-950" style={{ fontSize: 17, fontWeight: 600 }}>
                      {micPermission === "denied" ? "Microphone unavailable" : "Tap to record"}
                    </p>
                    <p className="text-kashmir-blue-300 mt-1" style={{ fontSize: 13 }}>
                      Record your doctor's words during your visit
                    </p>
                  </div>
                </div>

                {/* Secondary Options — pinned to bottom */}
                <div className="w-full space-y-2 pb-4">
                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-kashmir-blue-100" />
                    <span className="text-kashmir-blue-300" style={{ fontSize: 12 }}>or</span>
                    <div className="flex-1 h-px bg-kashmir-blue-100" />
                  </div>
                  <button
                    onClick={() => {
                      setShowPasteArea((v) => !v);
                    }}
                    className="w-full bg-white border border-kashmir-blue-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-kashmir-blue-500/10 flex items-center justify-center shrink-0">
                      <Clipboard className="w-4 h-4 text-kashmir-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-kashmir-blue-950" style={{ fontSize: 14, fontWeight: 500 }}>Paste a transcript</p>
                      <p className="text-kashmir-blue-300" style={{ fontSize: 12 }}>Type or paste what your doctor said</p>
                    </div>
                    <motion.div animate={{ rotate: showPasteArea ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="w-4 h-4 text-kashmir-blue-300" />
                    </motion.div>
                  </button>

                  {/* Paste area */}
                  <AnimatePresence>
                    {showPasteArea && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white rounded-2xl border border-kashmir-blue-200 overflow-hidden">
                          <textarea
                            ref={textareaRef}
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste your doctor's words here..."
                            className="w-full p-4 resize-none bg-transparent text-kashmir-blue-950 placeholder:text-kashmir-blue-300 outline-none"
                            style={{ fontSize: 14, minHeight: 140, lineHeight: 1.6 }}
                            autoFocus
                          />
                          <div className="flex items-center justify-between px-4 py-3 border-t border-kashmir-blue-100">
                            <button onClick={handlePasteExample} className="flex items-center gap-1.5 text-kashmir-blue-500" style={{ fontSize: 13 }}>
                              <Clipboard className="w-3.5 h-3.5" /> Try example
                            </button>
                            <span className="text-kashmir-blue-300" style={{ fontSize: 12 }}>
                              {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : ""}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleSummarize}
                          disabled={!transcript.trim()}
                          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-2 ${
                            transcript.trim() ? "bg-kashmir-blue-500 text-white active:scale-[0.98]" : "bg-kashmir-blue-100 text-kashmir-blue-300"
                          }`}
                          style={{ fontSize: 15, fontWeight: 600 }}
                        >
                          <ScanText className="w-5 h-5" />
                          Summarize Visit
                        </button>
                        {transcript.trim() && transcript.trim().split(/\s+/).length < 10 && (
                          <p className="text-center text-kashmir-blue-300 mt-2" style={{ fontSize: 12 }}>At least 10 words required to summarize</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button className="w-full bg-white border border-kashmir-blue-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-kashmir-blue-500/10 flex items-center justify-center shrink-0">
                      <FileAudio className="w-4 h-4 text-kashmir-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-kashmir-blue-950" style={{ fontSize: 14, fontWeight: 500 }}>Upload a recording</p>
                      <p className="text-kashmir-blue-300" style={{ fontSize: 12 }}>Import an audio file from your device</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-kashmir-blue-300" />
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* ======================== LOADING STEP ======================== */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "calc(100vh - 160px)" }}
          >
            {/* Processing */}
            {(processingState === "processing" || processingState === "slow") && (
              <>
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-kashmir-blue-500/10 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <ScanText className="w-8 h-8 text-kashmir-blue-500" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-3 rounded-3xl border-2 border-kashmir-blue-500/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-kashmir-blue-950" style={{ fontSize: 16, fontWeight: 600 }}>Reading your visit...</p>
                  <p className="text-kashmir-blue-300 mt-1" style={{ fontSize: 13 }}>Translating medical language into plain words</p>
                  {processingState === "slow" && (
                    <p className="text-kashmir-blue-400 mt-3 bg-kashmir-blue-100 rounded-xl px-4 py-2" style={{ fontSize: 12 }}>
                      This is taking a bit longer than usual. Hang tight.
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-kashmir-blue-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                  ))}
                </div>
                <button onClick={handleBack} className="text-kashmir-blue-300 mt-4" style={{ fontSize: 13 }}>Cancel</button>
              </>
            )}

            {/* Error: Network */}
            {processingState === "error-network" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#d4183d]/8 flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-[#d4183d]" />
                </div>
                <div className="text-center">
                  <p className="text-kashmir-blue-950" style={{ fontSize: 16, fontWeight: 600 }}>Connection issue</p>
                  <p className="text-kashmir-blue-300 mt-1 max-w-[280px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    We couldn't reach our servers. Check your internet connection and try again.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleRetry} className="px-6 py-3 rounded-2xl bg-kashmir-blue-500 text-white flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600 }}>
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button onClick={handleReset} className="px-5 py-3 rounded-2xl border border-kashmir-blue-200 text-kashmir-blue-800" style={{ fontSize: 14 }}>
                    Go Back
                  </button>
                </div>
              </>
            )}

            {/* Error: Inaudible */}
            {processingState === "error-inaudible" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#e6a817]/10 flex items-center justify-center">
                  <MicOff className="w-8 h-8 text-[#e6a817]" />
                </div>
                <div className="text-center">
                  <p className="text-kashmir-blue-950" style={{ fontSize: 16, fontWeight: 600 }}>Couldn't understand audio</p>
                  <p className="text-kashmir-blue-300 mt-1 max-w-[280px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    The recording was too quiet or unclear to transcribe. Try recording again in a quieter setting, or paste the transcript manually.
                  </p>
                </div>
                <button onClick={handleReset} className="px-6 py-3 rounded-2xl bg-kashmir-blue-500 text-white flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600 }}>
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </>
            )}

            {/* Error: Too Short */}
            {processingState === "error-too-short" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#e6a817]/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-[#e6a817]" />
                </div>
                <div className="text-center">
                  <p className="text-kashmir-blue-950" style={{ fontSize: 16, fontWeight: 600 }}>Not enough to summarize</p>
                  <p className="text-kashmir-blue-300 mt-1 max-w-[280px]" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    The transcript was too short to generate a meaningful summary. Try adding more of what your doctor said.
                  </p>
                </div>
                <button onClick={handleReset} className="px-6 py-3 rounded-2xl bg-kashmir-blue-500 text-white flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600 }}>
                  <RotateCcw className="w-4 h-4" /> Go Back
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ======================== RESULT STEP ======================== */}
        {step === "result" && summary && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col min-h-screen"
          >
            {/* Hero Header */}
            <div className="px-5 pt-14 pb-10" style={{ background: "#f5f7fa" }}>
              <div className="flex items-center justify-between mb-10">
                <button onClick={handleBack} className="w-9 h-9 rounded-xl bg-white/70 border border-kashmir-blue-200 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 text-kashmir-blue-800" />
                </button>
                <span className="bg-kashmir-blue-500/12 text-kashmir-blue-500 rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 500 }}>
                  AI Summary
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-kashmir-blue-500/15 flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-kashmir-blue-500" />
                </div>
                <p className="text-kashmir-blue-400" style={{ fontSize: 13 }}>Visit Summary</p>
                <p className="text-kashmir-blue-950 mt-1" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
                  {new Date(savedVisit?.date ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p className="text-kashmir-blue-300" style={{ fontSize: 13 }}>
                  {new Date(savedVisit?.date ?? Date.now()).toLocaleDateString("en-US", { weekday: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* White bottom sheet */}
            <div className="flex-1 bg-white rounded-t-3xl -mt-5 px-5 pt-6 pb-8">
              {/* 3-Tab Switcher */}
              <div className="bg-[#f0f2f6] rounded-2xl p-1 flex gap-1 mb-6">
                {(["Diagnosis", "Medications", "Next Steps"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      activeTab === tab ? "bg-white text-kashmir-blue-950" : "text-kashmir-blue-300"
                    }`}
                    style={{ fontSize: 12, fontWeight: activeTab === tab ? 600 : 400 }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "Diagnosis" && (
                    <div>
                      {summary.diagnosis ? (
                        <DiagnosisContent text={summary.diagnosis} conditionName={summary.conditionName} />
                      ) : (
                        <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No diagnosis recorded.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "Medications" && (
                    <div className="space-y-4">
                      {summary.medications.length === 0 ? (
                        <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No medications recorded.</p>
                      ) : summary.medications.map((med, i) => (
                        <div key={i} className="bg-kashmir-blue-50 rounded-2xl p-4 space-y-3">
                          <p className="text-kashmir-blue-950" style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</p>
                          <div>
                            <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>What it does</p>
                            <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.whatItDoes}</p>
                          </div>
                          <div>
                            <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>How to take it</p>
                            <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.howToTake}</p>
                          </div>
                          <div>
                            <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Side effects</p>
                            <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{med.sideEffects}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Next Steps" && (
                    <div>
                      {summary.nextSteps.length === 0 ? (
                        <p className="text-kashmir-blue-300" style={{ fontSize: 14 }}>No next steps recorded.</p>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-[12px] top-7 bottom-7 w-px bg-kashmir-blue-200" />
                          <div className="space-y-5">
                            {summary.nextSteps.map((s, i) => {
                              const isCompleted = stepState.completedIndices.includes(i);
                              return (
                                <button key={i} onClick={() => handleToggleStep(i)} disabled={!visitId} className="flex gap-4 items-start w-full text-left">
                                  <div className={`w-[26px] h-[26px] rounded-[6px] flex items-center justify-center shrink-0 relative z-10 transition-colors ${isCompleted ? "bg-kashmir-blue-600" : "bg-white border border-kashmir-blue-200"}`}>
                                    {isCompleted
                                      ? <Check className="w-3.5 h-3.5 text-kashmir-blue-50" strokeWidth={2.5} />
                                      : <span className="text-kashmir-blue-500" style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                                    }
                                  </div>
                                  <div className="flex-1 flex flex-col gap-0.5">
                                    <p className={`transition-colors ${isCompleted ? "text-kashmir-blue-300 line-through" : "text-kashmir-blue-950"}`} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{s.title}</p>
                                    <p className={`transition-colors ${isCompleted ? "text-kashmir-blue-200" : "text-kashmir-blue-400"}`} style={{ fontSize: 13, lineHeight: 1.6 }}>{s.description}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Disclaimer */}
              <p className="text-kashmir-blue-300 text-center mt-8 mb-4" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Not medical advice. Always follow your care team's guidance.
              </p>

              {/* Spacer so content isn't hidden behind fixed bar */}
              <div style={{ height: 88 }} />
            </div>

            {/* Fixed bottom action bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-kashmir-blue-100 px-5 pt-3 pb-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  saved ? "bg-kashmir-blue-100 text-kashmir-blue-500" : "bg-kashmir-blue-500 text-white active:scale-[0.98]"
                }`}
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {saved ? "Saved" : "Save to Visits"}
              </button>
              <button onClick={handleCopy} className="py-4 px-4 rounded-2xl border border-kashmir-blue-200 text-kashmir-blue-800 flex items-center justify-center active:scale-[0.98] transition-transform" style={{ fontSize: 14 }}>
                {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save Confirmation Dialog ── */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center"
            onClick={() => setShowSaveConfirm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="bg-white rounded-t-[28px] w-full max-w-[430px] px-6 pt-6 pb-10 flex flex-col gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-kashmir-blue-200 rounded-full mx-auto" />

              <div className="flex flex-col gap-2">
                <p className="text-kashmir-blue-950" style={{ fontSize: 18, fontWeight: 700 }}>
                  Before you save
                </p>
                <p className="text-kashmir-blue-400" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  Please confirm with your doctor that all the information in this summary — your diagnosis, medications, and next steps — is accurate before saving it to your visits.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmSave}
                  className="w-full bg-kashmir-blue-500 text-white rounded-2xl py-4"
                  style={{ fontSize: 15, fontWeight: 600 }}
                >
                  Confirm & save
                </button>
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="w-full bg-kashmir-blue-100 text-kashmir-blue-950 rounded-2xl py-4"
                  style={{ fontSize: 15, fontWeight: 600 }}
                >
                  Cancel & edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function SummarySection({ title, icon, iconBg, badge, expanded, onToggle, content }: {
  title: string; icon: React.ReactNode; iconBg: string; badge?: string; expanded: boolean; onToggle: () => void; content: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-kashmir-blue-200 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-4 text-left">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <span className="flex-1 text-kashmir-blue-950" style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        {badge && <span className="text-kashmir-blue-300 mr-2" style={{ fontSize: 12 }}>{badge}</span>}
        {expanded ? <ChevronUp className="w-4 h-4 text-kashmir-blue-300" /> : <ChevronDown className="w-4 h-4 text-kashmir-blue-300" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-kashmir-blue-400" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</p>
      <p className="text-kashmir-blue-800 mt-0.5" style={{ fontSize: 14, lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

function EmptySection() {
  return (
    <div className="bg-kashmir-blue-50 rounded-xl p-4">
      <p className="text-kashmir-blue-300" style={{ fontSize: 14, lineHeight: 1.6 }}>
        Your doctor did not mention anything in this area during this visit.
      </p>
    </div>
  );
}
