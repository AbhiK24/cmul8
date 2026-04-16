"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TopNav, Sidebar, InputBar, EmptyState, ThinkingIndicator } from "@/components"
import {
  UserMessage,
  EnvResponse,
  PollResponse,
  SimulationResponse,
} from "@/components/messages"
import { cohorts, mockSynthesis, modes } from "@/lib/mockData"
import {
  fetchEnvironments,
  fetchConversations,
  getConversation,
  sendMessage,
  type Environment,
  type Conversation,
  type ConversationMessage,
} from "@/lib/api"

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

interface ChatPageProps {
  conversationId?: string
}

export function ChatPage({ conversationId: initialConversationId }: ChatPageProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch environments and conversations on mount
  useEffect(() => {
    fetchEnvironments()
      .then((envs) => {
        setEnvironments(envs)
        if (envs.length > 0) setSelectedEnvId(envs[0].id)
      })
      .catch(console.error)

    loadConversations()
  }, [])

  // Load initial conversation if ID provided
  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId)
    }
  }, [initialConversationId])

  const loadConversations = async () => {
    try {
      const convs = await fetchConversations()
      setConversations(convs)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadConversation = async (convId: string) => {
    setIsLoadingConversation(true)
    try {
      const conv = await getConversation(convId)
      if (conv.environment_id) {
        setSelectedEnvId(conv.environment_id)
      }

      // Convert conversation messages to UI messages
      const uiMessages: Message[] = (conv.messages || []).map((msg: ConversationMessage) => {
        if (msg.role === "user") {
          return {
            id: msg.id,
            type: "user" as const,
            content: msg.content,
            mode: "ask",
          }
        } else {
          return {
            id: msg.id,
            type: "env" as const,
            content: msg.content,
            mode: "ask",
            data: {
              text: msg.content,
              source: "Environment Data",
            },
          }
        }
      })

      setMessages(uiMessages)
      setSelectedConversationId(convId)
    } catch (error) {
      console.error("Failed to load conversation:", error)
      router.push("/nzta")
    } finally {
      setIsLoadingConversation(false)
    }
  }

  // Handle selecting a conversation from sidebar
  const handleSelectConversation = useCallback((convId: string | null) => {
    if (convId) {
      router.push(`/nzta/c/${convId}`)
    } else {
      router.push("/nzta")
      setSelectedConversationId(null)
      setMessages([])
    }
  }, [router])

  // Handle new chat
  const handleNewChat = useCallback(() => {
    router.push("/nzta")
    setSelectedConversationId(null)
    setMessages([])
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(async (
    message: string,
    mode: string,
    selectedCohorts: string[],
    selectedEnvIds: string[],
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

    try {
      let responseMessage: Message

      if (mode === "ask") {
        const envId = selectedEnvIds[0] || selectedEnvId
        if (!envId) {
          throw new Error("No environment selected. Please create an environment first.")
        }

        const result = await sendMessage(
          envId,
          message,
          selectedConversationId || undefined,
          "query"
        )

        // If this was a new conversation, navigate to the new URL
        if (!selectedConversationId && result.conversation_id) {
          setSelectedConversationId(result.conversation_id)
          router.push(`/nzta/c/${result.conversation_id}`)
          loadConversations()
        }

        const env = environments.find(e => e.id === envId)

        responseMessage = {
          id: result.message.id,
          type: "env",
          content: message,
          mode,
          data: {
            text: result.message.content,
            source: env?.name || "Environment Data",
          },
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
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: "env",
        content: message,
        mode,
        data: {
          text: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
          source: "System",
        },
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }, [selectedEnvId, environments, selectedConversationId, router])

  const handleSuggestionClick = (suggestion: string, mode: string) => {
    const modeObj = modes.find((m) => m.id === mode)
    if (modeObj) {
      handleSend(suggestion, mode, [cohorts[0].id, cohorts[1].id], [], [])
    }
  }

  const handleStop = () => {
    setIsProcessing(false)
  }

  if (isLoadingConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[rgba(255,255,255,0.5)]">Loading conversation...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <TopNav
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          selectedConversation={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          conversations={conversations}
          onConversationsChange={loadConversations}
          onNewChat={handleNewChat}
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
                    const data = message.data as {
                      text: string
                      chart?: { type: "bar"; data: Array<{ zone: string; value: number }> }
                      source: string
                    }
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
                {isProcessing && <ThinkingIndicator />}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          <InputBar
            onSend={handleSend}
            isProcessing={isProcessing}
            onStop={handleStop}
            environments={environments}
            onEnvironmentsChange={() => {
              fetchEnvironments()
                .then(setEnvironments)
                .catch(console.error)
            }}
          />
        </main>
      </div>
    </div>
  )
}
