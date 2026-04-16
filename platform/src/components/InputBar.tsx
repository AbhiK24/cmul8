"use client"

import { useState, useRef } from "react"
import {
  Paperclip,
  ChevronDown,
  Send,
  Square,
  X,
  Check,
  FileText,
  Image as ImageIcon,
} from "lucide-react"
import { modes, cohorts, datasets, type Mode } from "@/lib/mockData"

const modeColors: Record<string, string> = {
  poll: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30",
  ask: "bg-[#00e5a0]/20 text-[#00e5a0] border-[#00e5a0]/30",
  sim: "bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30",
  extract: "bg-[#64748b]/20 text-[#64748b] border-[#64748b]/30",
}

const datasetTypeColors: Record<string, string> = {
  DEMO: "bg-[#00e5a0]/20 text-[#00e5a0]",
  ECON: "bg-[#fbbf24]/20 text-[#fbbf24]",
  GEO: "bg-[#a78bfa]/20 text-[#a78bfa]",
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
  const [cohortVersions, setCohortVersions] = useState<Record<string, string>>({
    c1: "V1",
    c2: "V1",
  })
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([datasets[0].id])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isProcessing) {
      onSend(message, selectedMode.id, selectedCohorts, selectedDatasets, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
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
        type: file.type.startsWith("image/")
          ? "image"
          : file.name.endsWith(".pdf")
          ? "pdf"
          : "csv",
      }))
      setAttachments([...attachments, ...newAttachments])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  const toggleCohort = (cohortId: string) => {
    setSelectedCohorts((prev) =>
      prev.includes(cohortId)
        ? prev.filter((id) => id !== cohortId)
        : [...prev, cohortId]
    )
  }

  const toggleDataset = (datasetId: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    )
  }

  const selectedCohortCount = selectedCohorts.length
  const selectedDatasetCount = selectedDatasets.length

  return (
    <div className="border-t border-[#27272a] bg-[#09090b] p-4">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
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
              <span className="max-w-32 truncate">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-0.5 hover:bg-[#27272a] rounded transition-colors"
              >
                <X className="w-3 h-3 text-[#a1a1aa]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <div className="relative mb-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, run a poll, or describe a policy..."
          className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 pr-12 text-[#fafafa] placeholder-[#52525b] resize-none focus:outline-none focus:border-[#3f3f46] transition-colors"
          rows={2}
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Attach */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.csv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] hover:bg-[#18181b] transition-colors text-sm text-[#a1a1aa]"
          >
            <Paperclip className="w-4 h-4" />
            <span className="hidden sm:inline">Attach</span>
          </button>

          {/* Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setModeDropdownOpen(!modeDropdownOpen)
                setCohortDropdownOpen(false)
                setEnvDropdownOpen(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
                modeColors[selectedMode.id]
              }`}
            >
              <span>Mode: {selectedMode.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {modeDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-50">
                <div className="py-1">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode)
                        setModeDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#27272a] transition-colors ${
                        mode.id === selectedMode.id
                          ? "text-[#00e5a0]"
                          : "text-[#fafafa]"
                      }`}
                    >
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-xs text-[#a1a1aa]">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cohort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCohortDropdownOpen(!cohortDropdownOpen)
                setModeDropdownOpen(false)
                setEnvDropdownOpen(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] hover:bg-[#18181b] transition-colors text-sm text-[#a1a1aa]"
            >
              <span>
                {selectedCohortCount > 0
                  ? `Cohort: ${selectedCohortCount} selected`
                  : "No cohort"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {cohortDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-50">
                <div className="py-1">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="px-4 py-2 hover:bg-[#27272a] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleCohort(cohort.id)}
                          className="flex items-center gap-2 flex-1"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              selectedCohorts.includes(cohort.id)
                                ? "bg-[#00e5a0] border-[#00e5a0]"
                                : "border-[#52525b]"
                            }`}
                          >
                            {selectedCohorts.includes(cohort.id) && (
                              <Check className="w-3 h-3 text-[#09090b]" />
                            )}
                          </div>
                          <span className="text-[#fafafa]">{cohort.name}</span>
                          <span className="text-xs text-[#a1a1aa]">
                            ({cohort.agentCount} agents)
                          </span>
                        </button>
                        <select
                          value={cohortVersions[cohort.id] || cohort.versions[0]}
                          onChange={(e) =>
                            setCohortVersions({
                              ...cohortVersions,
                              [cohort.id]: e.target.value,
                            })
                          }
                          className="bg-[#27272a] border-none rounded px-2 py-0.5 text-xs text-[#a1a1aa] focus:outline-none"
                        >
                          {cohort.versions.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-[#27272a] mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-[#27272a] transition-colors text-[#a1a1aa] text-sm">
                      + Add Cohort
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Env Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setEnvDropdownOpen(!envDropdownOpen)
                setModeDropdownOpen(false)
                setCohortDropdownOpen(false)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] hover:bg-[#18181b] transition-colors text-sm text-[#a1a1aa]"
            >
              <span>
                {selectedDatasetCount > 0
                  ? `Env: ${selectedDatasetCount} datasets`
                  : "No env"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {envDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-50">
                <div className="py-1">
                  {datasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => toggleDataset(dataset.id)}
                      className="w-full px-4 py-2 hover:bg-[#27272a] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedDatasets.includes(dataset.id)
                              ? "bg-[#00e5a0] border-[#00e5a0]"
                              : "border-[#52525b]"
                          }`}
                        >
                          {selectedDatasets.includes(dataset.id) && (
                            <Check className="w-3 h-3 text-[#09090b]" />
                          )}
                        </div>
                        <span className="text-[#fafafa]">{dataset.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            datasetTypeColors[dataset.type]
                          }`}
                        >
                          {dataset.type}
                        </span>
                        {dataset.status === "processing" && (
                          <span className="text-[10px] text-[#fbbf24]">Processing</span>
                        )}
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-[#27272a] mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-[#27272a] transition-colors text-[#a1a1aa] text-sm">
                      + Upload Dataset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={isProcessing ? onStop : handleSubmit}
          disabled={!message.trim() && !isProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isProcessing
              ? "bg-[#fb7185] hover:bg-[#f43f5e] text-white"
              : message.trim()
              ? "bg-[#00e5a0] hover:bg-[#00cc8e] text-[#09090b]"
              : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
