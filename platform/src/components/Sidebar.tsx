"use client"

import { Plus, MessageSquare, MoreHorizontal } from "lucide-react"
import { conversationHistory, type Conversation, type ConversationMode } from "@/lib/mockData"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  open: boolean
  selectedConversation: string | null
  onSelectConversation: (id: string | null) => void
}

const modeColors: Record<ConversationMode, string> = {
  POLL: "text-amber-400",
  ASK: "text-emerald-400",
  SIM: "text-violet-400",
  EXTRACT: "text-slate-400",
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
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const groupedConversations = groupByDate(conversationHistory)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="h-full bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden"
        >
          <div className="p-3">
            <button
              onClick={() => onSelectConversation(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-full font-medium text-[14px] hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>New chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {Object.entries(groupedConversations).map(([date, conversations]) => (
              <div key={date} className="mb-1">
                <div className="px-3 py-2 text-[11px] font-medium text-[rgba(255,255,255,0.35)] uppercase tracking-wide">
                  {date}
                </div>
                {conversations.map((conv) => (
                  <div key={conv.id} className="relative" ref={menuOpen === conv.id ? menuRef : null}>
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      onMouseEnter={() => setHoveredConversation(conv.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-3 group ${
                        selectedConversation === conv.id
                          ? "bg-[rgba(255,255,255,0.08)]"
                          : "hover:bg-[rgba(255,255,255,0.04)]"
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${modeColors[conv.mode]} opacity-60`} />
                      <span className="text-[14px] text-[rgba(255,255,255,0.8)] truncate flex-1">
                        {conv.title}
                      </span>
                      {(hoveredConversation === conv.id || menuOpen === conv.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(menuOpen === conv.id ? null : conv.id)
                          }}
                          className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                        </button>
                      )}
                    </button>

                    {menuOpen === conv.id && (
                      <div className="absolute right-2 top-full mt-1 w-36 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl overflow-hidden z-50">
                        <button className="w-full text-left px-3 py-2 text-[13px] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                          Rename
                        </button>
                        <button className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
