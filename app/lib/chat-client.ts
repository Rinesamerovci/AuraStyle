import { createBrowserClient } from '@supabase/ssr'

export async function sendChatMessage(message: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get chat response')
  }

  const data = await response.json()
  return data.reply
}
