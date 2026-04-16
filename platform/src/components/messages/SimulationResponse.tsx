"use client"

import { motion } from "framer-motion"
import { Check, Circle, Plus, ChevronDown, Play } from "lucide-react"

interface SimulationResponseProps {
  scenario: string
  envReady: boolean
  agentsReady: boolean
}

export function SimulationResponse({
  scenario,
  envReady,
  agentsReady,
}: SimulationResponseProps) {
  const allReady = envReady && agentsReady

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-6"
    >
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[12px] font-medium text-violet-400 uppercase tracking-wider">
              Simulation Setup
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-[15px] text-white font-medium mb-5">
            Configure your simulation
          </h3>

          <div className="space-y-0">
            {/* Scenario */}
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Scenario</span>
              <span className="text-[13px] text-white max-w-md truncate">
                {scenario}
              </span>
            </div>

            {/* Environment */}
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Environment</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-white">District 7</span>
                {envReady ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-[rgba(255,255,255,0.2)]" />
                )}
              </div>
            </div>

            {/* Agents */}
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Agents</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-white">
                  NZTA Drivers V1 + Non-Drivers V1
                </span>
                {agentsReady ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-[rgba(255,255,255,0.2)]" />
                )}
              </div>
            </div>

            {/* Policy */}
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Policy lever</span>
              <button className="flex items-center gap-1.5 text-[13px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add lever</span>
              </button>
            </div>

            {/* Model */}
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Model</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                <span>Nash Equilibrium</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
          </div>

          <button
            disabled={!allReady}
            className={`w-full mt-5 py-3 rounded-xl font-medium text-[14px] transition-all flex items-center justify-center gap-2 ${
              allReady
                ? "bg-violet-500 hover:bg-violet-600 text-white"
                : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
            }`}
          >
            <Play className="w-4 h-4" />
            Launch Simulation
          </button>
        </div>
      </div>
    </motion.div>
  )
}
