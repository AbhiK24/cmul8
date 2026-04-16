"use client"

import { motion } from "framer-motion"
import { FileText, Image as ImageIcon } from "lucide-react"

interface Attachment {
  id: string
  name: string
  type: "image" | "pdf" | "csv"
}

interface UserMessageProps {
  content: string
  mode: string
  attachments?: Attachment[]
}

const modeLabels: Record<string, string> = {
  poll: "Poll",
  ask: "Query",
  sim: "Simulation",
  extract: "Extract",
}

const modeBadgeColors: Record<string, { bg: string; text: string }> = {
  poll: { bg: "bg-amber-500/10", text: "text-amber-400" },
  ask: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  sim: { bg: "bg-violet-500/10", text: "text-violet-400" },
  extract: { bg: "bg-slate-500/10", text: "text-slate-400" },
}

export function UserMessage({ content, mode, attachments = [] }: UserMessageProps) {
  const colors = modeBadgeColors[mode] || modeBadgeColors.ask

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end mb-6"
    >
      <div className="max-w-[85%]">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px]"
              >
                {attachment.type === "image" ? (
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                ) : (
                  <FileText className="w-4 h-4 text-emerald-400" />
                )}
                <span className="max-w-32 truncate text-[rgba(255,255,255,0.6)]">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-[rgba(255,255,255,0.08)] rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-[15px] text-white leading-relaxed">{content}</p>
          <div className="mt-2 flex justify-end">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {modeLabels[mode]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
