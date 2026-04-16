"use client"

import { useState, useRef, useEffect } from "react"
import { Paperclip, ChevronDown, ArrowUp, Square, X, FileText, Image as ImageIcon, Check, Plus, Upload, Loader2 } from "lucide-react"
import { modes, cohorts, type Mode } from "@/lib/mockData"
import { uploadDataset, createEnvironment, fetchDatasets, type Environment, type Dataset } from "@/lib/api"

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
  onSend: (message: string, mode: string, selectedCohorts: string[], selectedEnvIds: string[], attachments: Attachment[]) => void
  isProcessing?: boolean
  onStop?: () => void
  environments?: Environment[]
  onEnvironmentsChange?: () => void
}

export function InputBar({ onSend, isProcessing = false, onStop, environments = [], onEnvironmentsChange }: InputBarProps) {
  const [message, setMessage] = useState("")
  const [selectedMode, setSelectedMode] = useState<Mode>(modes[0])
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const [cohortDropdownOpen, setCohortDropdownOpen] = useState(false)
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false)
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([cohorts[0].id])
  const [cohortVersions, setCohortVersions] = useState<Record<string, string>>({ c1: "V1", c2: "V1" })
  const [selectedEnvIds, setSelectedEnvIds] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingDataset, setUploadingDataset] = useState(false)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([])
  const [newEnvName, setNewEnvName] = useState("")
  const [creatingEnv, setCreatingEnv] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const datasetInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modeRef = useRef<HTMLDivElement>(null)
  const cohortRef = useRef<HTMLDivElement>(null)
  const envRef = useRef<HTMLDivElement>(null)

  // Select first environment when available
  useEffect(() => {
    if (environments.length > 0 && selectedEnvIds.length === 0) {
      setSelectedEnvIds([environments[0].id])
    }
  }, [environments, selectedEnvIds.length])

  // Fetch datasets when modal opens
  useEffect(() => {
    if (showUploadModal) {
      fetchDatasets().then(setDatasets).catch(console.error)
    }
  }, [showUploadModal])

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
      onSend(message, selectedMode.id, selectedCohorts, selectedEnvIds, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleDatasetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDataset(true)
    try {
      const dataset = await uploadDataset(file, file.name)
      setDatasets(prev => [...prev, dataset])
      setSelectedDatasetIds(prev => [...prev, dataset.id])
    } catch (error) {
      console.error("Failed to upload dataset:", error)
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploadingDataset(false)
      if (datasetInputRef.current) datasetInputRef.current.value = ""
    }
  }

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim() || selectedDatasetIds.length === 0) return

    setCreatingEnv(true)
    try {
      await createEnvironment(newEnvName, selectedDatasetIds)
      setShowUploadModal(false)
      setNewEnvName("")
      setSelectedDatasetIds([])
      onEnvironmentsChange?.()
    } catch (error) {
      console.error("Failed to create environment:", error)
      alert(error instanceof Error ? error.message : "Failed to create environment")
    } finally {
      setCreatingEnv(false)
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
        <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl focus-within:border-[rgba(255,255,255,0.15)] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or describe a scenario..."
            className="w-full bg-transparent px-4 pt-4 pb-14 text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] resize-none outline-none ring-0 focus:outline-none focus:ring-0 min-h-[56px] max-h-[200px]"
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
                  <span>{selectedEnvIds.length > 0 ? `${selectedEnvIds.length} env` : "No env"}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {envDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-1">
                      {environments.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <p className="text-[13px] text-[rgba(255,255,255,0.5)] mb-3">No environments yet</p>
                          <button
                            onClick={() => { setEnvDropdownOpen(false); setShowUploadModal(true) }}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[13px] hover:bg-emerald-500/30 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Create Environment
                          </button>
                        </div>
                      ) : (
                        <>
                          {environments.map((env) => (
                            <button key={env.id} onClick={() => setSelectedEnvIds((prev) => prev.includes(env.id) ? prev.filter((id) => id !== env.id) : [...prev, env.id])} className="w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedEnvIds.includes(env.id) ? "bg-white border-white" : "border-[rgba(255,255,255,0.3)]"}`}>
                                {selectedEnvIds.includes(env.id) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-[13px] text-[rgba(255,255,255,0.8)]">{env.name}</div>
                                <div className="text-[11px] text-[rgba(255,255,255,0.4)]">
                                  {env.status === "ready" ? `${env.chunk_count || 0} chunks indexed` : env.status}
                                </div>
                              </div>
                            </button>
                          ))}
                          <div className="border-t border-[rgba(255,255,255,0.1)] mt-1 pt-1">
                            <button
                              onClick={() => { setEnvDropdownOpen(false); setShowUploadModal(true) }}
                              className="w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2 text-[13px] text-emerald-400"
                            >
                              <Plus className="w-4 h-4" />
                              New Environment
                            </button>
                          </div>
                        </>
                      )}
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

      {/* Dataset Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
              <div>
                <h2 className="text-lg font-medium text-white">Create Environment</h2>
                <p className="text-[13px] text-[rgba(255,255,255,0.4)] mt-0.5">Upload datasets and build a queryable environment</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <X className="w-5 h-5 text-[rgba(255,255,255,0.5)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Environment Name */}
              <div>
                <label className="block text-[13px] text-[rgba(255,255,255,0.6)] mb-2">Environment Name</label>
                <input
                  type="text"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  placeholder="e.g., NZTA Traffic Analysis"
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
                />
              </div>

              {/* Upload Area */}
              <div>
                <label className="block text-[13px] text-[rgba(255,255,255,0.6)] mb-2">Datasets</label>
                <input
                  ref={datasetInputRef}
                  type="file"
                  accept=".csv,.json,.pdf,.xlsx,.xls"
                  onChange={handleDatasetUpload}
                  className="hidden"
                />
                <button
                  onClick={() => datasetInputRef.current?.click()}
                  disabled={uploadingDataset}
                  className="w-full py-8 border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)] transition-all group"
                >
                  {uploadingDataset ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-[13px] text-[rgba(255,255,255,0.5)]">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                        <Upload className="w-5 h-5 text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.6)]" />
                      </div>
                      <div className="text-center">
                        <span className="text-[13px] text-[rgba(255,255,255,0.6)]">Drop files here or </span>
                        <span className="text-[13px] text-emerald-400">browse</span>
                      </div>
                      <span className="text-[11px] text-[rgba(255,255,255,0.3)]">CSV, JSON, PDF, Excel supported</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Dataset List */}
              {datasets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[rgba(255,255,255,0.6)]">Available Datasets</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.4)]">{selectedDatasetIds.length} selected</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {datasets.map((dataset) => (
                      <button
                        key={dataset.id}
                        onClick={() => setSelectedDatasetIds(prev =>
                          prev.includes(dataset.id) ? prev.filter(id => id !== dataset.id) : [...prev, dataset.id]
                        )}
                        className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                          selectedDatasetIds.includes(dataset.id)
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-[rgba(255,255,255,0.02)] border border-transparent hover:bg-[rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${
                          dataset.type === "csv" ? "bg-blue-500/20 text-blue-400" :
                          dataset.type === "json" ? "bg-amber-500/20 text-amber-400" :
                          dataset.type === "pdf" ? "bg-red-500/20 text-red-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {dataset.type.toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[13px] text-white truncate">{dataset.name}</div>
                          <div className="text-[11px] text-[rgba(255,255,255,0.4)]">
                            {dataset.row_count ? `${dataset.row_count.toLocaleString()} rows` : "Processing..."}
                            {dataset.status !== "ready" && ` · ${dataset.status}`}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedDatasetIds.includes(dataset.id)
                            ? "border-emerald-400 bg-emerald-400"
                            : "border-[rgba(255,255,255,0.2)]"
                        }`}>
                          {selectedDatasetIds.includes(dataset.id) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEnvironment}
                disabled={!newEnvName.trim() || selectedDatasetIds.length === 0 || creatingEnv}
                className={`px-5 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${
                  newEnvName.trim() && selectedDatasetIds.length > 0 && !creatingEnv
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
                }`}
              >
                {creatingEnv ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Environment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
