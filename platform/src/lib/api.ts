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
