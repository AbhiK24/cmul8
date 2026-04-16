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
  poll: "via Poll",
  ask: "via Ask ENV",
  sim: "via Simulation",
  extract: "via Extract",
}

const modeBadgeColors: Record<string, string> = {
  poll: "bg-[#fbbf24]/20 text-[#fbbf24]",
  ask: "bg-[#00e5a0]/20 text-[#00e5a0]",
  sim: "bg-[#a78bfa]/20 text-[#a78bfa]",
  extract: "bg-[#64748b]/20 text-[#64748b]",
}

export function UserMessage({ content, mode, attachments = [] }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end mb-4"
    >
      <div className="max-w-2xl">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-sm"
              >
                {attachment.type === "image" ? (
                  <ImageIcon className="w-4 h-4 text-[#a78bfa]" />
                ) : (
                  <FileText className="w-4 h-4 text-[#00e5a0]" />
                )}
                <span className="max-w-32 truncate text-[#a1a1aa]">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-[#27272a] rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-[#fafafa]">{content}</p>
          <div className="mt-2 flex justify-end">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                modeBadgeColors[mode]
              }`}
            >
              {modeLabels[mode]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
