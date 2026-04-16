"use client"

import { useState, useRef, useEffect } from "react"
import { TopNav, Sidebar, InputBar, EmptyState } from "@/components"
import {
  UserMessage,
  EnvResponse,
  PollResponse,
  SimulationResponse,
} from "@/components/messages"
import {
  cohorts,
  mockEnvResponse,
  mockSynthesis,
  modes,
} from "@/lib/mockData"

type MessageType = "user" | "env" | "poll" | "sim"

interface Attachment {
  id: string
  name: string
  type: "image" | "pdf" | "csv"
}

interface Message {
  id: string
  type: MessageType
  content: string
  mode: string
  attachments?: Attachment[]
  data?: unknown
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (
    message: string,
    mode: string,
    selectedCohorts: string[],
    selectedDatasets: string[],
    attachments: Attachment[]
  ) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: message,
      mode,
      attachments,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    // Simulate response after delay
    setTimeout(() => {
      let responseMessage: Message

      if (mode === "ask") {
        responseMessage = {
          id: `msg-${Date.now()}-response`,
          type: "env",
          content: message,
          mode,
          data: mockEnvResponse,
        }
      } else if (mode === "sim") {
        responseMessage = {
          id: `msg-${Date.now()}-response`,
          type: "sim",
          content: message,
          mode,
          data: { scenario: message, envReady: true, agentsReady: true },
        }
      } else {
        // Poll mode (default)
        const selectedCohortData = cohorts.filter((c) =>
          selectedCohorts.includes(c.id)
        )
        const allAgents = selectedCohortData.flatMap((c) => c.agents)
        responseMessage = {
          id: `msg-${Date.now()}-response`,
          type: "poll",
          content: message,
          mode,
          data: {
            question: message,
            cohortNames: selectedCohortData.map(
              (c) => `${c.name} (${c.agentCount})`
            ),
            agents: allAgents,
            synthesis: mockSynthesis,
            hasAttachment: attachments.length > 0,
          },
        }
      }

      setMessages((prev) => [...prev, responseMessage])
      setIsProcessing(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string, mode: string) => {
    const modeObj = modes.find((m) => m.id === mode)
    if (modeObj) {
      handleSend(suggestion, mode, [cohorts[0].id, cohorts[1].id], [], [])
    }
  }

  const handleStop = () => {
    setIsProcessing(false)
  }

  return (
    <div className="h-full flex flex-col">
      <TopNav
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isLive={isProcessing}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => {
                  if (message.type === "user") {
                    return (
                      <UserMessage
                        key={message.id}
                        content={message.content}
                        mode={message.mode}
                        attachments={message.attachments}
                      />
                    )
                  }
                  if (message.type === "env") {
                    const data = message.data as typeof mockEnvResponse
                    return (
                      <EnvResponse
                        key={message.id}
                        text={data.text}
                        chart={data.chart}
                        source={data.source}
                      />
                    )
                  }
                  if (message.type === "poll") {
                    const data = message.data as {
                      question: string
                      cohortNames: string[]
                      agents: typeof cohorts[0]["agents"]
                      synthesis: string
                      hasAttachment: boolean
                    }
                    return (
                      <PollResponse
                        key={message.id}
                        question={data.question}
                        cohortNames={data.cohortNames}
                        agents={data.agents}
                        synthesis={data.synthesis}
                        hasAttachment={data.hasAttachment}
                      />
                    )
                  }
                  if (message.type === "sim") {
                    const data = message.data as {
                      scenario: string
                      envReady: boolean
                      agentsReady: boolean
                    }
                    return (
                      <SimulationResponse
                        key={message.id}
                        scenario={data.scenario}
                        envReady={data.envReady}
                        agentsReady={data.agentsReady}
                      />
                    )
                  }
                  return null
                })}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-[#a1a1aa] py-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#00e5a0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#00e5a0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#00e5a0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          <InputBar
            onSend={handleSend}
            isProcessing={isProcessing}
            onStop={handleStop}
          />
        </main>
      </div>
    </div>
  )
}
