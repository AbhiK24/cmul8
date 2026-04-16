"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Brain, Sparkles, Database } from "lucide-react"

interface ThinkingIndicatorProps {
  mode?: string
}

const stages = [
  { id: "search", label: "Searching environment", icon: Search, duration: 1500 },
  { id: "retrieve", label: "Retrieving relevant data", icon: Database, duration: 1200 },
  { id: "analyze", label: "Analyzing patterns", icon: Brain, duration: 2000 },
  { id: "generate", label: "Generating response", icon: Sparkles, duration: 1500 },
]

export function ThinkingIndicator({ mode = "ask" }: ThinkingIndicatorProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stage = stages[currentStage]
    if (!stage) return

    // Progress animation within each stage
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100))
    }, stage.duration / 50)

    // Move to next stage
    const stageTimeout = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage((s) => s + 1)
        setProgress(0)
      }
    }, stage.duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stageTimeout)
    }
  }, [currentStage])

  const CurrentIcon = stages[currentStage]?.icon || Search

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <CurrentIcon className="w-4 h-4 text-emerald-400" />
          </motion.div>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[14px] text-white font-medium"
              >
                {stages[currentStage]?.label}
              </motion.div>
            </AnimatePresence>
            <div className="text-[12px] text-[rgba(255,255,255,0.4)]">
              Step {currentStage + 1} of {stages.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStage / stages.length) * 100 + (progress / stages.length)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex gap-2">
          {stages.map((stage, i) => {
            const StageIcon = stage.icon
            const isActive = i === currentStage
            const isComplete = i < currentStage

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                  isComplete
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isActive
                    ? "bg-[rgba(255,255,255,0.08)] text-white"
                    : "bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.3)]"
                }`}
              >
                <StageIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{stage.label.split(" ")[0]}</span>
                {isComplete && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-emerald-400"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
