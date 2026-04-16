"use client"

import { Menu, ChevronDown } from "lucide-react"
import { Logo } from "./Logo"
import { workspaces } from "@/lib/mockData"
import { useState, useRef, useEffect } from "react"

interface TopNavProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopNav({ sidebarOpen, onToggleSidebar }: TopNavProps) {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWorkspaceDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] flex items-center px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 -ml-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-[rgba(255,255,255,0.5)]" />
      </button>

      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 text-[rgba(255,255,255,0.9)] hover:text-white transition-colors">
          <Logo size="sm" className="opacity-70" />
          <span className="font-medium text-[15px] tracking-[-0.01em]">cmul8</span>
        </a>

        <span className="text-[rgba(255,255,255,0.2)]">/</span>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[rgba(255,255,255,0.7)] hover:text-white"
          >
            <span className="text-[15px]">{currentWorkspace.name}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws)
                      setWorkspaceDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-[14px] ${
                      ws.id === currentWorkspace.id
                        ? "bg-[rgba(255,255,255,0.08)] text-white"
                        : "text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-[rgba(255,255,255,0.08)] p-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-[14px] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.7)] transition-colors">
                  + New Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
