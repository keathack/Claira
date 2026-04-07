import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const slides = [
  {
    title: "The gap between visit and understanding",
    desc: "You leave the doctor's office with notes you can't read and instructions you're not sure about. For patients managing ongoing conditions across multiple providers, keeping up with your own care can feel overwhelming.",
    color: "#577399",
  },
  {
    title: "Your visit, made clear",
    desc: "Claira captures what your doctor said and turns it into a plain-language summary — your condition, your medications, and your next steps, all in one place.",
    color: "#465e83",
  },
  {
    title: "Track how you're feeling",
    desc: "Log symptoms between visits so nothing slips through the cracks. When your next appointment comes, you'll have a clear picture of how you've been doing.",
    color: "#d4183d",
  },
  {
    title: "Supporting you, not replacing your doctor",
    desc: "Doctors are busy. Claira helps patients understand their care so providers can focus on what they do best. It's not a replacement — it's a bridge.",
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
        <button onClick={onComplete} className="text-kashmir-blue-300 px-3 py-1" style={{ fontSize: 14 }}>
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-kashmir-blue-950 mb-3" style={{ fontSize: 28, fontWeight: 700 }}>{slide.title}</h2>
            <p className="text-kashmir-blue-400" style={{ fontSize: 15, lineHeight: 1.7 }}>{slide.desc}</p>
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
          className="w-full py-4 rounded-2xl bg-kashmir-blue-500 text-white flex items-center justify-center gap-2"
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          {isLast ? "Get Started" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
