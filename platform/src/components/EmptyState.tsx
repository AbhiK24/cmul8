"use client"

import { motion } from "framer-motion"
import { Logo } from "./Logo"
import { Users, Database, Play } from "lucide-react"

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string, mode: string) => void
}

const suggestions = [
  {
    icon: Users,
    label: "Poll agents",
    prompt: "Would you support a congestion charge in exchange for improved public transit?",
    mode: "poll",
  },
  {
    icon: Database,
    label: "Query environment",
    prompt: "What is the median income distribution across District 7 zones?",
    mode: "ask",
  },
  {
    icon: Play,
    label: "Run simulation",
    prompt: "Simulate the impact of a $5 daily congestion charge on commuter behavior",
    mode: "sim",
  },
]

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-3 mb-3"
      >
        <Logo size="lg" className="opacity-50" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-[28px] font-medium text-white tracking-[-0.02em] mb-2"
      >
        What would you like to simulate?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[15px] text-[rgba(255,255,255,0.5)] mb-10"
      >
        Poll agents, query data, or run policy scenarios
      </motion.p>

      <div className="flex flex-wrap gap-3 justify-center max-w-xl">
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
            onClick={() => onSuggestionClick(suggestion.prompt, suggestion.mode)}
            className="flex items-center gap-2.5 px-4 py-3 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[rgba(255,255,255,0.15)] hover:bg-[#1a1a1a] transition-all text-[14px] text-[rgba(255,255,255,0.7)] hover:text-white group"
          >
            <suggestion.icon className="w-4 h-4 opacity-50 group-hover:opacity-70 transition-opacity" />
            <span>{suggestion.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
