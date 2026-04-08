import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Groq } from 'groq-sdk'

const MAX_RETRIES = 2
const MAX_MESSAGE_LENGTH = 5000
const RATE_LIMIT_REQUESTS = 10
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

// Simple in-memory rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

// Edge case: Check rate limiting per user
function checkRateLimit(userId: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const existing = requestCounts.get(userId)

  if (!existing || now > existing.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (existing.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, error: 'Shumë kërkesa. Prisni disa sekonda.' }
  }

  existing.count++
  return { allowed: true }
}

// Validate incoming message
function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Mesazhi është i kërkuar.' }
  }

  if (!message.trim()) {
    return { valid: false, error: 'Mesazhi nuk mund të jetë bosh.' }
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Mesazhi është shumë i gjatë. Maksimum ${MAX_MESSAGE_LENGTH} karaktere.` }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Edge case: Missing authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Duhet të jeni i kyçur për të marrë këshilla stili.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Token i pavlefshëm. Ju lutemi hyrni përsëri.' },
        { status: 401 }
      )
    }

    // Edge case: Verify user session is still valid
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Sesioni ka skaduar. Ju lutemi hyrni përsëri.' },
        { status: 401 }
      )
    }

    // Edge case: Check rate limiting per user
    const rateLimitCheck = checkRateLimit(user.id)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      )
    }

    // Edge case: Validate message payload
    let messageBody: unknown
    try {
      messageBody = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Payload i pavlefshëm. Ju lutemi provoni përsëri.' },
        { status: 400 }
      )
    }

    const message = (messageBody as Record<string, unknown>).message as string
    const messageValidation = validateMessage(message)
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: messageValidation.error },
        { status: 400 }
      )
    }

    // Edge case: Call Groq API with timeout and retry logic
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s timeout

        const result = await Promise.race([
          groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'Je AuraStyle, një stilist personal AI. Jep sugjerime outfit-esh, paleta ngjyrash dhe këshilla stili. Përgjigju shkurt dhe qartë.'
              },
              { role: 'user', content: message }
            ],
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Groq API timeout')), 25000)
          )
        ])

        clearTimeout(timeoutId)

        const reply = result.choices[0]?.message?.content || ''
        if (!reply) {
          throw new Error('Empty response from AI')
        }

        return NextResponse.json({ reply })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        // Only retry on specific errors
        if (attempt < MAX_RETRIES && (
          lastError.message.includes('timeout') ||
          lastError.message.includes('ECONNREFUSED') ||
          lastError.message.includes('ETIMEDOUT')
        )) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
          continue
        }
        
        // Don't retry on other errors
        break
      }
    }

    // If we've exhausted retries, return error
    console.error('AI API Error after retries:', lastError?.message || 'Unknown error')
    return NextResponse.json(
      { error: 'Nuk mund të komunikon me AuraStyle. Provo përsëri më vonë.' },
      { status: 503 }
    )
  } catch (error: unknown) {
    console.error('Chat API Error:', getErrorMessage(error))
    return NextResponse.json(
      { error: 'Gabim gjatë procesimit. Ju lutemi provoni përsëri.' },
      { status: 500 }
    )
  }
}
