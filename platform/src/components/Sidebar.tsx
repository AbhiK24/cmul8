"use client"

import { Plus, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Conversation, deleteConversation } from "@/lib/api"

interface SidebarProps {
  open: boolean
  selectedConversation: string | null
  onSelectConversation: (id: string | null) => void
  conversations: Conversation[]
  onConversationsChange: () => void
  onNewChat: () => void
}

const modeColors: Record<string, string> = {
  poll: "text-amber-400",
  ask: "text-emerald-400",
  query: "text-emerald-400",
  sim: "text-violet-400",
  extract: "text-slate-400",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function groupByDate(conversations: Conversation[]) {
  const groups: Record<string, Conversation[]> = {}
  conversations.forEach((conv) => {
    const dateLabel = formatDate(conv.created_at)
    if (!groups[dateLabel]) {
      groups[dateLabel] = []
    }
    groups[dateLabel].push(conv)
  })
  return groups
}

export function Sidebar({
  open,
  selectedConversation,
  onSelectConversation,
  conversations,
  onConversationsChange,
  onNewChat,
}: SidebarProps) {
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const groupedConversations = groupByDate(conversations)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDelete = async (convId: string) => {
    setDeleting(convId)
    try {
      await deleteConversation(convId)
      if (selectedConversation === convId) {
        onSelectConversation(null)
      }
      onConversationsChange()
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    } finally {
      setDeleting(null)
      setMenuOpen(null)
    }
  }

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
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-full font-medium text-[14px] hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>New chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {conversations.length === 0 ? (
              <div className="px-3 py-8 text-center text-[13px] text-[rgba(255,255,255,0.3)]">
                No conversations yet
              </div>
            ) : (
              Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date} className="mb-1">
                  <div className="px-3 py-2 text-[11px] font-medium text-[rgba(255,255,255,0.35)] uppercase tracking-wide">
                    {date}
                  </div>
                  {convs.map((conv) => (
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
                        <MessageSquare
                          className={`w-4 h-4 flex-shrink-0 ${modeColors[conv.mode] || "text-emerald-400"} opacity-60`}
                        />
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
                          <button
                            onClick={() => handleDelete(conv.id)}
                            disabled={deleting === conv.id}
                            className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleting === conv.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
