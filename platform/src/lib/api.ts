/**
 * API client for CMUL8 backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://nzta-backend-production.up.railway.app"

// Types
export interface Dataset {
  id: string
  name: string
  description?: string
  type: string
  status: "processing" | "ready" | "failed"
  row_count?: number
  columns?: string[]
  created_at: string
}

export interface Environment {
  id: string
  name: string
  description?: string
  dataset_ids: string[]
  status: "building" | "ready" | "failed"
  chunk_count?: number
  created_at: string
}

export interface QueryResult {
  answer: string
  sources?: Array<{
    source_name: string
    text: string
  }>
  chart?: {
    type: string
    data: Array<{ [key: string]: string | number }>
  }
  steps?: Array<{
    step: string
    status: string
    output?: string
  }>
}

// API functions
export async function fetchDatasets(projectId = "default"): Promise<Dataset[]> {
  const res = await fetch(`${API_BASE}/api/datasets?project_id=${projectId}`)
  if (!res.ok) throw new Error("Failed to fetch datasets")
  return res.json()
}

export async function uploadDataset(
  file: File,
  name?: string,
  description?: string
): Promise<Dataset> {
  const formData = new FormData()
  formData.append("file", file)
  if (name) formData.append("name", name)
  if (description) formData.append("description", description)

  const res = await fetch(`${API_BASE}/api/datasets/upload`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || "Failed to upload dataset")
  }
  return res.json()
}

export async function deleteDataset(datasetId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/datasets/${datasetId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete dataset")
}

export async function fetchEnvironments(projectId = "default"): Promise<Environment[]> {
  const res = await fetch(`${API_BASE}/api/environments?project_id=${projectId}`)
  if (!res.ok) throw new Error("Failed to fetch environments")
  return res.json()
}

export async function createEnvironment(
  name: string,
  datasetIds: string[],
  description?: string
): Promise<Environment> {
  const res = await fetch(`${API_BASE}/api/environments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      dataset_ids: datasetIds,
      description,
    }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || "Failed to create environment")
  }
  return res.json()
}

export async function queryEnvironment(
  envId: string,
  question: string,
  mode: "analyze" | "simple" = "analyze"
): Promise<QueryResult> {
  const res = await fetch(`${API_BASE}/api/environments/${envId}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || "Query failed")
  }
  return res.json()
}

export async function deleteEnvironment(envId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/environments/${envId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete environment")
}

// Conversation types
export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{ chunk_id: string; text: string; score: number; dataset: string }>
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  mode: string
  environment_id?: string
  created_at: string
  messages?: ConversationMessage[]
}

export interface SendMessageResponse {
  conversation_id: string
  message: ConversationMessage
  sources?: Array<{ chunk_id: string; text: string; score: number; dataset: string }>
}

// Conversation API functions
export async function fetchConversations(projectId = "default"): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/chat/conversations?project_id=${projectId}`)
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${conversationId}`)
  if (!res.ok) throw new Error("Failed to fetch conversation")
  return res.json()
}

export async function sendMessage(
  environmentId: string,
  content: string,
  conversationId?: string,
  mode: string = "query"
): Promise<SendMessageResponse> {
  const res = await fetch(`${API_BASE}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      environment_id: environmentId,
      content,
      conversation_id: conversationId,
      mode,
    }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || "Failed to send message")
  }
  return res.json()
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${conversationId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete conversation")
}
