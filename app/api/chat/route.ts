import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Groq } from 'groq-sdk'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
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

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Duhet të jeni i kyçur për të marrë këshilla stili.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Duhet të jeni i kyçur për të marrë këshilla stili.' },
        { status: 401 }
      )
    }

    const { message } = await request.json()

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Je AuraStyle, një stilist personal AI. Jep sugjerime outfit-esh, paleta ngjyrash dhe këshilla stili. Përgjigju shkurt dhe qartë.'
        },
        { role: 'user', content: message }
      ],
    })

    const reply = result.choices[0]?.message?.content || ''
    return NextResponse.json({ reply })
  } catch (error: unknown) {
    console.error('Chat API Error:', getErrorMessage(error))
    return NextResponse.json({ error: 'Gabim gjatë komunikimit me AuraStyle' }, { status: 500 })
  }
}
