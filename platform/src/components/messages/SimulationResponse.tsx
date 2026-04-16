"use client"

import { motion } from "framer-motion"
import { Check, Circle, Plus, ChevronDown } from "lucide-react"

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden border-l-4 border-l-[#a78bfa]">
        <div className="px-4 py-2 border-b border-[#27272a]">
          <span className="text-xs font-mono text-[#a78bfa] uppercase tracking-wider">
            Simulation
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-[#fafafa] font-medium mb-4">
            Configure your simulation run
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
              <span className="text-[#a1a1aa]">Scenario:</span>
              <span className="text-[#fafafa] text-sm max-w-md truncate">
                {scenario}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
              <span className="text-[#a1a1aa]">Env:</span>
              <div className="flex items-center gap-2">
                <span className="text-[#fafafa] text-sm">District 7</span>
                {envReady ? (
                  <Check className="w-4 h-4 text-[#00e5a0]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#52525b]" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
              <span className="text-[#a1a1aa]">Agents:</span>
              <div className="flex items-center gap-2">
                <span className="text-[#fafafa] text-sm">
                  NZTA Drivers V1 + Non-Drivers V1
                </span>
                {agentsReady ? (
                  <Check className="w-4 h-4 text-[#00e5a0]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#52525b]" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
              <span className="text-[#a1a1aa]">Policy:</span>
              <button className="flex items-center gap-1 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add lever</span>
                <Circle className="w-4 h-4 text-[#52525b] ml-2" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#a1a1aa]">Model:</span>
              <button className="flex items-center gap-1 px-3 py-1 bg-[#27272a] rounded text-sm text-[#fafafa] hover:bg-[#3f3f46] transition-colors">
                <span>Nash</span>
                <ChevronDown className="w-4 h-4" />
                <Circle className="w-4 h-4 text-[#52525b] ml-2" />
              </button>
            </div>
          </div>

          <button
            disabled={!allReady}
            className={`w-full mt-4 py-2.5 rounded-lg font-medium transition-colors ${
              allReady
                ? "bg-[#a78bfa] hover:bg-[#8b5cf6] text-white"
                : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
            }`}
          >
            Launch Simulation →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
