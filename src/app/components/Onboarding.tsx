import { useState } from "react";
import { Sparkles, Shield, Heart, ArrowRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const HERO_IMG = "https://images.unsplash.com/photo-1758654859923-339c0f2f925e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGludGVyaW9yJTIwY2xlYW58ZW58MXx8fHwxNzc0ODA4OTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const slides = [
  {
    icon: Sparkles,
    title: "Understand your visits",
    desc: "Claira translates what your doctor said into clear, plain language you can reference anytime.",
    color: "#577399",
  },
  {
    icon: Mic,
    title: "Record or paste",
    desc: "Record your doctor's words during or after your appointment, or paste a transcript. Claira does the rest.",
    color: "#465e83",
  },
  {
    icon: Heart,
    title: "Track how you feel",
    desc: "Log symptoms and side effects between visits so you're always prepared for your next appointment.",
    color: "#d4183d",
  },
  {
    icon: Shield,
    title: "Your doctor is the authority",
    desc: "Claira only surfaces what your doctor said — nothing more. It supports your care, never replaces it.",
    color: "#394c6b",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((s) => s + 1);
    }
  };

  return (
    <div className="px-5 pt-8 pb-8 min-h-screen flex flex-col" style={{ fontFamily: "'Area Normal', sans-serif" }}>
      {/* Skip */}
      <div className="flex justify-end">
        <button onClick={onComplete} className="text-[#a9b9d0] px-3 py-1" style={{ fontSize: 14 }}>
          Skip
        </button>
      </div>

      {/* Hero Image */}
      <div className="mt-4 mb-8 rounded-3xl overflow-hidden h-[200px]">
        <ImageWithFallback src={HERO_IMG} alt="Claira" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: slide.color + "14" }}>
              <slide.icon className="w-6 h-6" style={{ color: slide.color }} />
            </div>
            <h2 className="text-[#1e2533] mb-3" style={{ fontSize: 24, fontWeight: 700 }}>{slide.title}</h2>
            <p className="text-[#7a94b6]" style={{ fontSize: 15, lineHeight: 1.7 }}>{slide.desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 my-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? 24 : 8,
                backgroundColor: i === currentSlide ? "#577399" : "#d1d9e6",
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-[#577399] text-white flex items-center justify-center gap-2"
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          {isLast ? "Get Started" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
