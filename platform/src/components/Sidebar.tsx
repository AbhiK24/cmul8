"use client"

import { Plus, MoreHorizontal } from "lucide-react"
import { conversationHistory, type Conversation, type ConversationMode } from "@/lib/mockData"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  open: boolean
  selectedConversation: string | null
  onSelectConversation: (id: string | null) => void
}

const modeBadgeColors: Record<ConversationMode, string> = {
  POLL: "bg-[#fbbf24]/20 text-[#fbbf24]",
  ASK: "bg-[#00e5a0]/20 text-[#00e5a0]",
  SIM: "bg-[#a78bfa]/20 text-[#a78bfa]",
  EXTRACT: "bg-[#64748b]/20 text-[#64748b]",
}

function groupByDate(conversations: Conversation[]) {
  const groups: Record<string, Conversation[]> = {}
  conversations.forEach((conv) => {
    if (!groups[conv.date]) {
      groups[conv.date] = []
    }
    groups[conv.date].push(conv)
  })
  return groups
}

export function Sidebar({ open, selectedConversation, onSelectConversation }: SidebarProps) {
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null)
  const groupedConversations = groupByDate(conversationHistory)

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-[#09090b] border-r border-[#27272a] flex flex-col overflow-hidden"
        >
          <div className="p-3">
            <button
              onClick={() => onSelectConversation(null)}
              className="w-full flex items-center gap-2 px-3 py-2 border border-[#27272a] rounded-lg hover:bg-[#18181b] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {Object.entries(groupedConversations).map(([date, conversations]) => (
              <div key={date} className="mb-4">
                <div className="px-3 py-2 text-xs font-mono text-[#52525b] uppercase tracking-wider">
                  {date}
                </div>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    onMouseEnter={() => setHoveredConversation(conv.id)}
                    onMouseLeave={() => setHoveredConversation(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                      selectedConversation === conv.id
                        ? "bg-[#27272a]"
                        : "hover:bg-[#18181b]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm truncate">{conv.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            modeBadgeColors[conv.mode]
                          }`}
                        >
                          {conv.mode}
                        </span>
                      </div>
                    </div>
                    {hoveredConversation === conv.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="p-1 hover:bg-[#3f3f46] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#a1a1aa]" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
