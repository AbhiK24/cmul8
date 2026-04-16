"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, AlertTriangle, User, Eye, Download, ArrowRight } from "lucide-react"
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="py-4 border-b border-[rgba(255,255,255,0.06)] last:border-b-0"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
            <User className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
          </div>
          <span className="font-medium text-[14px] text-white">{agent.name}</span>
        </div>
        <span className="text-[12px] text-[rgba(255,255,255,0.4)]">
          {agent.confidence}% confident
        </span>
      </div>

      <p className="text-[15px] text-[rgba(255,255,255,0.85)] mb-3 pl-[42px] leading-relaxed">"{agent.response}"</p>

      <div className="pl-[42px]">
        <button
          onClick={() => setReasoningOpen(!reasoningOpen)}
          className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)] transition-colors"
        >
          <span>View reasoning</span>
          {reasoningOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {reasoningOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <p className="text-[13px] text-[rgba(255,255,255,0.5)] mb-3 leading-relaxed">{agent.reasoning}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {agent.drivers.map((driver) => (
                <span
                  key={driver}
                  className="px-2.5 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-md text-[11px] text-[rgba(255,255,255,0.5)] hover:border-[rgba(255,255,255,0.1)] transition-colors cursor-default"
                >
                  {driver}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-2.5 text-[11px] text-[rgba(255,255,255,0.3)]">
          <span>{agent.cohort}</span>
          <span className="opacity-50">·</span>
          <span>{agent.version}</span>
          {agent.isOutlier && (
            <>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1 text-rose-400/70">
                <AlertTriangle className="w-3 h-3" />
                outlier
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-6"
    >
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[12px] font-medium text-amber-400 uppercase tracking-wider">
              Poll Results
            </span>
          </div>
          {hasAttachment && (
            <span className="flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.4)]">
              <Eye className="w-3 h-3" />
              Visual attached
            </span>
          )}
        </div>

        {/* Question */}
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-[15px] text-white font-medium mb-1.5">"{question}"</p>
          <p className="text-[12px] text-[rgba(255,255,255,0.4)]">
            {cohortNames.join(" · ")}
          </p>
        </div>

        {/* Agents */}
        <div className="px-5 max-h-[400px] overflow-y-auto">
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        {/* Synthesis */}
        <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[#0f0f0f]">
          <div className="text-[11px] font-medium text-amber-400/80 uppercase tracking-wider mb-2">
            Synthesis
          </div>
          <p className="text-[14px] text-[rgba(255,255,255,0.85)] leading-relaxed">{synthesis}</p>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[rgba(255,255,255,0.6)] hover:text-white transition-all">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[rgba(255,255,255,0.6)] hover:text-white transition-all">
              Follow-up
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
