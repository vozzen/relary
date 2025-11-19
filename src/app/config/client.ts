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
    }).catch((err) => {
      if (err.name === 'AbortError') {
        throw new Error('İstek zaman aşımına uğradı')
      }
      throw new Error('Bağlantı hatası oluştu')
    })

    if (!res.ok) {
      let message = 'İstek başarısız oldu'
      if (res.status === 404) {
        message = 'İstenen kaynak bulunamadı'
      } else if (res.status === 500) {
        message = 'Sunucu hatası oluştu'
      } else if (res.status >= 400 && res.status < 500) {
        message = 'Geçersiz istek'
      } else if (res.status >= 500) {
        message = 'Sunucu yanıt vermiyor'
      }
      
      const err: ApiError = new Error(`${message} (${res.status})`)
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
