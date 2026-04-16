"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Brain, Sparkles, Database, Loader2 } from "lucide-react"

const stages = [
  { id: "search", label: "Searching environment", icon: Search },
  { id: "retrieve", label: "Retrieving data", icon: Database },
  { id: "analyze", label: "Analyzing", icon: Brain },
  { id: "generate", label: "Generating response", icon: Sparkles },
]

export function ThinkingIndicator() {
  const [currentStage, setCurrentStage] = useState(0)
  const [dots, setDots] = useState("")

  // Cycle through stages every 2s, loop back from last stage
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((s) => (s + 1) % stages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const CurrentIcon = stages[currentStage]?.icon || Search

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] text-white font-medium">
              {stages[currentStage]?.label}{dots}
            </div>
            <div className="text-[12px] text-[rgba(255,255,255,0.4)]">
              This may take a few seconds
            </div>
          </div>
          <div className="flex gap-1.5">
            {stages.map((stage, i) => {
              const StageIcon = stage.icon
              const isActive = i === currentStage
              return (
                <div
                  key={stage.id}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.3)]"
                  }`}
                >
                  <StageIcon className="w-3.5 h-3.5" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
