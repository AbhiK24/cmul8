"use client"

import { useState, useRef, useEffect } from "react"
import { Paperclip, ChevronDown, ArrowUp, Square, X, FileText, Image as ImageIcon, Check } from "lucide-react"
import { modes, cohorts, datasets, type Mode } from "@/lib/mockData"

const modeColors: Record<string, { bg: string; text: string; border: string }> = {
  poll: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  ask: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  sim: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  extract: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
}

interface Attachment {
  id: string
  name: string
  type: "image" | "pdf" | "csv"
}

interface InputBarProps {
  onSend: (message: string, mode: string, selectedCohorts: string[], selectedDatasets: string[], attachments: Attachment[]) => void
  isProcessing?: boolean
  onStop?: () => void
}

export function InputBar({ onSend, isProcessing = false, onStop }: InputBarProps) {
  const [message, setMessage] = useState("")
  const [selectedMode, setSelectedMode] = useState<Mode>(modes[0])
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const [cohortDropdownOpen, setCohortDropdownOpen] = useState(false)
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false)
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([cohorts[0].id])
  const [cohortVersions, setCohortVersions] = useState<Record<string, string>>({ c1: "V1", c2: "V1" })
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([datasets[0].id])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modeRef = useRef<HTMLDivElement>(null)
  const cohortRef = useRef<HTMLDivElement>(null)
  const envRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeRef.current && !modeRef.current.contains(event.target as Node)) setModeDropdownOpen(false)
      if (cohortRef.current && !cohortRef.current.contains(event.target as Node)) setCohortDropdownOpen(false)
      if (envRef.current && !envRef.current.contains(event.target as Node)) setEnvDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !isProcessing) {
      onSend(message, selectedMode.id, selectedCohorts, selectedDatasets, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : file.name.endsWith(".pdf") ? "pdf" : "csv",
      }))
      setAttachments([...attachments, ...newAttachments])
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const colors = modeColors[selectedMode.id]

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[13px]">
                {attachment.type === "image" ? <ImageIcon className="w-4 h-4 text-violet-400" /> : <FileText className="w-4 h-4 text-emerald-400" />}
                <span className="max-w-32 truncate text-[rgba(255,255,255,0.7)]">{attachment.name}</span>
                <button onClick={() => setAttachments(attachments.filter((a) => a.id !== attachment.id))} className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                  <X className="w-3 h-3 text-[rgba(255,255,255,0.5)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden focus-within:border-[rgba(255,255,255,0.2)] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or describe a scenario..."
            className="w-full bg-transparent px-4 pt-4 pb-14 text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] resize-none focus:outline-none min-h-[56px] max-h-[200px]"
            rows={1}
          />

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Attach */}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.csv" multiple onChange={handleFileSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.7)]">
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="w-px h-5 bg-[rgba(255,255,255,0.1)] mx-1" />

              {/* Mode */}
              <div className="relative" ref={modeRef}>
                <button onClick={() => { setModeDropdownOpen(!modeDropdownOpen); setCohortDropdownOpen(false); setEnvDropdownOpen(false) }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${colors.bg} ${colors.text} ${colors.border}`}>
                  <span>{selectedMode.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {modeDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50">
                    {modes.map((mode) => (
                      <button key={mode.id} onClick={() => { setSelectedMode(mode); setModeDropdownOpen(false) }} className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${mode.id === selectedMode.id ? "bg-[rgba(255,255,255,0.08)] text-white" : "text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)]"}`}>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-[11px] text-[rgba(255,255,255,0.4)] mt-0.5">{mode.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cohort */}
              <div className="relative" ref={cohortRef}>
                <button onClick={() => { setCohortDropdownOpen(!cohortDropdownOpen); setModeDropdownOpen(false); setEnvDropdownOpen(false) }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.03)] text-[13px] text-[rgba(255,255,255,0.6)] transition-colors">
                  <span>{selectedCohorts.length} cohort{selectedCohorts.length !== 1 ? "s" : ""}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {cohortDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-1">
                      {cohorts.map((cohort) => (
                        <button key={cohort.id} onClick={() => setSelectedCohorts((prev) => prev.includes(cohort.id) ? prev.filter((id) => id !== cohort.id) : [...prev, cohort.id])} className="w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCohorts.includes(cohort.id) ? "bg-white border-white" : "border-[rgba(255,255,255,0.3)]"}`}>
                            {selectedCohorts.includes(cohort.id) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[13px] text-[rgba(255,255,255,0.8)]">{cohort.name}</div>
                            <div className="text-[11px] text-[rgba(255,255,255,0.4)]">{cohort.agentCount} agents</div>
                          </div>
                          <select value={cohortVersions[cohort.id] || cohort.versions[0]} onChange={(e) => { e.stopPropagation(); setCohortVersions({ ...cohortVersions, [cohort.id]: e.target.value }) }} onClick={(e) => e.stopPropagation()} className="bg-[rgba(255,255,255,0.05)] border-none rounded px-2 py-0.5 text-[11px] text-[rgba(255,255,255,0.6)] focus:outline-none">
                            {cohort.versions.map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Env */}
              <div className="relative" ref={envRef}>
                <button onClick={() => { setEnvDropdownOpen(!envDropdownOpen); setModeDropdownOpen(false); setCohortDropdownOpen(false) }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.03)] text-[13px] text-[rgba(255,255,255,0.6)] transition-colors">
                  <span>{selectedDatasets.length} env</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {envDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-1">
                      {datasets.map((dataset) => (
                        <button key={dataset.id} onClick={() => setSelectedDatasets((prev) => prev.includes(dataset.id) ? prev.filter((id) => id !== dataset.id) : [...prev, dataset.id])} className="w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedDatasets.includes(dataset.id) ? "bg-white border-white" : "border-[rgba(255,255,255,0.3)]"}`}>
                            {selectedDatasets.includes(dataset.id) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[13px] text-[rgba(255,255,255,0.8)]">{dataset.name}</div>
                            <div className="text-[11px] text-[rgba(255,255,255,0.4)]">{dataset.type} · {dataset.records.toLocaleString()} records</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Send */}
            <button onClick={isProcessing ? onStop : handleSubmit} disabled={!message.trim() && !isProcessing} className={`p-2 rounded-lg transition-all ${isProcessing ? "bg-red-500 hover:bg-red-600" : message.trim() ? "bg-white hover:opacity-90" : "bg-[rgba(255,255,255,0.1)] cursor-not-allowed"}`}>
              {isProcessing ? <Square className="w-4 h-4 text-white" fill="white" /> : <ArrowUp className={`w-4 h-4 ${message.trim() ? "text-black" : "text-[rgba(255,255,255,0.3)]"}`} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[rgba(255,255,255,0.3)] mt-3">
          Simulated responses are for research purposes. Validate insights with real data.
        </p>
      </div>
    </div>
  )
}
