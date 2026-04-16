"use client"

import { Menu, ChevronDown, User } from "lucide-react"
import { workspaces } from "@/lib/mockData"
import { useState } from "react"

interface TopNavProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  isLive?: boolean
}

export function TopNav({ sidebarOpen, onToggleSidebar, isLive = true }: TopNavProps) {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0])

  return (
    <header className="h-14 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[#27272a] rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-[#a1a1aa]" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight">CMUL8</span>
          <span className="text-[#52525b]">·</span>

          <div className="relative">
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 hover:bg-[#27272a] rounded-md transition-colors text-[#a1a1aa]"
            >
              <span>{currentWorkspace.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {workspaceDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-50">
                <div className="py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws)
                        setWorkspaceDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#27272a] transition-colors ${
                        ws.id === currentWorkspace.id ? "text-[#00e5a0]" : "text-[#fafafa]"
                      }`}
                    >
                      {ws.name}
                    </button>
                  ))}
                  <div className="border-t border-[#27272a] mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-[#27272a] transition-colors text-[#a1a1aa]">
                      + New Workspace
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-[#00e5a0] animate-pulse-jade" : "bg-[#52525b]"
            }`}
          />
          <span className="text-sm font-mono text-[#a1a1aa]">
            {isLive ? "Live" : "Idle"}
          </span>
        </div>

        <button className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center hover:bg-[#3f3f46] transition-colors">
          <User className="w-4 h-4 text-[#a1a1aa]" />
        </button>
      </div>
    </header>
  )
}
