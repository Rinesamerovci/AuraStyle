import { createBrowserClient } from '@supabase/ssr'

const TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const MAX_MESSAGE_LENGTH = 5000

export class SessionExpiredError extends Error {
  constructor(message = 'Sesioni ka skaduar. Ju lutemi hyrni përsëri.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Lidhje probleme. Kontrolloni internetin dhe provoni përsëri.') {
    super(message)
    this.name = 'NetworkError'
  }
}

function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new NetworkError('Lidhja zgjati shumë. Provo përsëri më vonë.')), ms)
    )
  ])
}

// Validate message before sending
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || !message.trim()) {
    return { valid: false, error: 'Shkruaj të paktën diçka për të marrë këshilla.' }
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Mesazhi është shumë i gjatë. Maksimum ${MAX_MESSAGE_LENGTH} karaktere.` }
  }

  return { valid: true }
}

export async function sendChatMessage(message: string, retryCount = 0): Promise<string> {
  // Validate input before attempting to send
  const validation = validateMessage(message)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Edge case: Session expired or missing
  if (sessionError || !session?.access_token) {
    throw new SessionExpiredError('Sesioni ka skaduar. Ju lutemi hyrni përsëri.')
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await timeoutPromise(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      }),
      TIMEOUT_MS + 1000
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Edge case: Unauthorized (token expired)
      if (response.status === 401) {
        throw new SessionExpiredError('Sesioni ka skaduar. Ju lutemi hyrni përsëri.')
      }

      // Edge case: Rate limit
      if (response.status === 429) {
        throw new Error('Shumë kërkesa. Prisni disa sekonda para se të provoni përsëri.')
      }

      // Edge case: Retry on server errors (5xx)
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return sendChatMessage(message, retryCount + 1)
      }

      throw new Error(errorData.error || 'Gabim gjatë komunikimit me AuraStyle. Provo përsëri.')
    }

    const data = await response.json()
    if (!data.reply) {
      throw new Error('Përgjigjja e mpreh. Provo përsëri.')
    }
    return data.reply
  } catch (error) {
    // Edge case: Abort signal (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return sendChatMessage(message, retryCount + 1)
      }
      throw new NetworkError('Lidhja zgjati shumë. Kontrolloni internetin dhe provoni përsëri.')
    }

    // Edge case: Network errors - retry with exponential backoff
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)))
        return sendChatMessage(message, retryCount + 1)
      }
      throw new NetworkError('Lidhje probleme. Kontrolloni internetin dhe provoni përsëri.')
    }

    // Re-throw known custom errors
    if (error instanceof SessionExpiredError || error instanceof NetworkError) {
      throw error
    }

    // Generic error
    throw error instanceof Error ? error : new Error('Diçka shkoi gabim. Provo përsëri.')
  }
}
