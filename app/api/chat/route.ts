import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mesazhi është i zbrazët' },
        { status: 400 }
      );
    }

    const result = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'Je AuraStyle, një stilist personal AI. Jep sugjerime outfit-esh, paleta ngjyrash dhe këshilla stili. Përgjigju shkurt dhe qartë.',
      messages: [
        { role: 'user', content: message }
      ],
    });

    const reply = result.content[0].type === 'text' ? result.content[0].text : '';
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Gabim gjatë komunikimit me AI' },
      { status: 500 }
    );
  }
}