import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const card = formData.get('card') as string

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  // Convert PDF to base64 for Claude
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          } as Anthropic.DocumentBlockParam,
          {
            type: 'text',
            text: `Extract all transactions from this ${card} credit card statement. Return ONLY a JSON array with no other text. Each item: { "date": "YYYY-MM-DD", "merchant": "string", "amount": number (positive for charges), "category": "one of: Dining, Groceries, Travel, Flights, Hotels, Streaming, Shopping, Gas, Health, Entertainment, Utilities, Other" }`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return NextResponse.json({ transactions: parsed, card })
  } catch {
    return NextResponse.json({ error: 'Failed to parse transactions', raw: text }, { status: 422 })
  }
}
