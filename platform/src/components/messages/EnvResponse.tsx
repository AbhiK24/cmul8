"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

interface ChartData {
  type: "bar"
  data: { zone: string; value: number }[]
}

interface EnvResponseProps {
  text: string
  chart?: ChartData
  source: string
}

export function EnvResponse({ text, chart, source }: EnvResponseProps) {
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
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] font-medium text-emerald-400 uppercase tracking-wider">
              Environment Query
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-[15px] text-[rgba(255,255,255,0.85)] leading-relaxed mb-4">{text}</p>

          {chart && chart.type === "bar" && (
            <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4 border border-[rgba(255,255,255,0.04)]">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={chart.data}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
                >
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="zone"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {chart.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#34d399" : "rgba(255,255,255,0.15)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-end gap-4 mt-3 text-[11px] text-[rgba(255,255,255,0.4)]">
                {chart.data.map((entry, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-sm ${i === 0 ? "bg-emerald-400" : "bg-[rgba(255,255,255,0.15)]"}`} />
                    {entry.zone}: {entry.value}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] text-[rgba(255,255,255,0.3)]">
            Source: {source}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
