"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, AlertTriangle, User, Eye } from "lucide-react"
import type { Agent } from "@/lib/mockData"

interface PollResponseProps {
  question: string
  cohortNames: string[]
  agents: Agent[]
  synthesis: string
  hasAttachment?: boolean
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const [reasoningOpen, setReasoningOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="py-4 border-b border-dashed border-[#27272a] last:border-b-0"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center">
            <User className="w-4 h-4 text-[#a1a1aa]" />
          </div>
          <span className="font-medium">{agent.name}</span>
        </div>
        <span className="text-sm font-mono text-[#a1a1aa]">
          Confidence {agent.confidence}%
        </span>
      </div>

      <p className="text-[#fafafa] mb-3 pl-10">"{agent.response}"</p>

      <div className="pl-10">
        <button
          onClick={() => setReasoningOpen(!reasoningOpen)}
          className="flex items-center gap-1 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          <span>Reasoning</span>
          {reasoningOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {reasoningOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2"
          >
            <p className="text-sm text-[#a1a1aa] mb-2">{agent.reasoning}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {agent.drivers.map((driver) => (
                <span
                  key={driver}
                  className="px-2 py-0.5 bg-[#27272a] rounded text-xs font-mono text-[#a1a1aa] hover:bg-[#3f3f46] cursor-pointer transition-colors"
                >
                  {driver}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-2 text-xs text-[#52525b]">
          <span>{agent.cohort}</span>
          <span>·</span>
          <span>{agent.version}</span>
          {agent.isOutlier && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#fb7185]">
                <AlertTriangle className="w-3 h-3" />
                outlier vs cohort
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function PollResponse({
  question,
  cohortNames,
  agents,
  synthesis,
  hasAttachment = false,
}: PollResponseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden border-l-4 border-l-[#fbbf24]">
        <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between">
          <span className="text-xs font-mono text-[#fbbf24] uppercase tracking-wider">
            Poll Results
          </span>
          {hasAttachment && (
            <span className="flex items-center gap-1 text-xs text-[#a1a1aa]">
              <Eye className="w-3 h-3" />
              Visual stimulus attached
            </span>
          )}
        </div>

        <div className="p-4 border-b border-[#27272a]">
          <p className="text-[#fafafa] font-medium mb-2">"{question}"</p>
          <p className="text-sm text-[#a1a1aa]">
            Cohorts: {cohortNames.join(" · ")}
          </p>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        <div className="px-4 py-3 border-t border-[#27272a] bg-[#0f0f11]">
          <div className="text-xs font-mono text-[#fbbf24] uppercase tracking-wider mb-2">
            Synthesis
          </div>
          <p className="text-[#fafafa] text-sm">{synthesis}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg text-xs font-mono transition-colors">
              Export JSON
            </button>
            <button className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg text-xs font-mono transition-colors">
              Ask a follow-up →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
