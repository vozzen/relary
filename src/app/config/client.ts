import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from './constants'

export interface ApiError extends Error {
  status?: number
  data?: unknown
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number
}

/**
 * Generic JSON request helper wrapping fetch with timeout & error normalization.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || API_REQUEST_TIMEOUT_MS)

  try {
      const res = await fetch(`${API_BASE_URL}${path}`.replaceAll('\\', '/'), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
          ...options.headers,
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      const err: ApiError = new Error(`Request failed: ${res.status}`)
      err.status = res.status
      try {
        err.data = await res.json()
      } catch {
        // ignore JSON parse errors
      }
      throw err
    }

    // Attempt JSON parse; allow empty responses
    const text = await res.text()
    return (text ? JSON.parse(text) : {}) as T
  } finally {
    clearTimeout(timeout)
  }
}
