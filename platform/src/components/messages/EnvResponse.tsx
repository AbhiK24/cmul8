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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden border-l-4 border-l-[#00e5a0]">
        <div className="px-4 py-2 border-b border-[#27272a]">
          <span className="text-xs font-mono text-[#00e5a0] uppercase tracking-wider">
            ENV
          </span>
        </div>
        <div className="p-4">
          <p className="text-[#fafafa] mb-4 leading-relaxed">{text}</p>

          {chart && chart.type === "bar" && (
            <div className="bg-[#09090b] rounded-lg p-4 mb-4">
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
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {chart.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#00e5a0" : "#3f3f46"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-end gap-4 mt-2 text-xs text-[#a1a1aa]">
                {chart.data.map((entry, i) => (
                  <span key={i}>
                    {entry.zone}: {entry.value}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-[#52525b]">Source: {source}</div>
        </div>
      </div>
    </motion.div>
  )
}
