import { createBrowserClient } from '@supabase/ssr'

const TIMEOUT_MS = 30000
const MAX_RETRIES = 2

function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Lidhja zgjati shumë. Provo përsëri.')), ms)
    )
  ])
}

export async function sendChatMessage(message: string, retryCount = 0): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Duhet të jeni i kyçur për të marrë këshilla stili.')
  }

  try {
    const response = await timeoutPromise(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
      }),
      TIMEOUT_MS
    )

    if (!response.ok) {
      const error = await response.json()
      
      // Retry on server errors (5xx)
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return sendChatMessage(message, retryCount + 1)
      }
      
      throw new Error(error.error || 'Gabim gjatë komunikimit me AuraStyle')
    }

    const data = await response.json()
    return data.reply
  } catch (error) {
    // Retry on network errors
    if (error instanceof TypeError && retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
      return sendChatMessage(message, retryCount + 1)
    }
    throw error
  }
}
