"use client"

import { motion } from "framer-motion"

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string, mode: string) => void
}

const suggestions = [
  {
    label: "Poll your agents",
    prompt: "Would you support a congestion charge in exchange for improved public transit?",
    mode: "poll",
  },
  {
    label: "Ask your environment",
    prompt: "What is the median income distribution across District 7 zones?",
    mode: "ask",
  },
  {
    label: "Run a scenario",
    prompt: "Simulate the impact of a $5 daily congestion charge on commuter behavior",
    mode: "sim",
  },
]

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-4"
    >
      <h1 className="text-4xl font-bold mb-4 tracking-tight">CMUL8</h1>
      <p className="text-[#a1a1aa] text-lg mb-8">What would you like to simulate?</p>

      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.prompt, suggestion.mode)}
            className="px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all text-sm text-[#a1a1aa] hover:text-[#fafafa]"
          >
            {suggestion.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
