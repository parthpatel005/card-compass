import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { transactions, benefits } from '@/db/schema'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import { CARD_MAP, CardId, getCardRecommendations } from '@/data/cardDefinitions'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a personal credit card rewards assistant with access to live transaction and benefit data. You help the user maximize rewards across their 4 travel cards:

1. **Chase Sapphire Preferred (CSP)** — 3x dining/streaming/online groceries, 5x Chase Travel, 2x travel, 1x else. Points: Chase Ultimate Rewards.
2. **Amex Gold** — 4x dining/US supermarkets (up to $25k/yr), 3x flights (direct/AmexTravel), 1x else. Credits: $10/mo Uber Cash, $10/mo dining. Points: Amex MR.
3. **Amex Platinum** — 5x flights (direct/AmexTravel), 5x prepaid hotels (AmexTravel), 1x else. Credits: $200 airline, $200 hotel, $200 Uber Cash, $240 digital, $155 Walmart+, $189 CLEAR, $300 Equinox, $100 Saks. Points: Amex MR.
4. **Capital One Venture X** — 10x hotels/rental cars (C1 Travel), 5x flights (C1 Travel), 2x everything else. Credits: $300 travel. Points: C1 Miles.

Always use tools to pull live data before answering spending or benefit questions. Be concise and actionable. Format numbers clearly. Use markdown tables when comparing options. When suggesting where to cut spending, be specific with amounts and categories.`

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_transactions',
    description:
      'Get transaction history with optional filters. Use this to look up recent spending, transactions in a specific category, or expenses on a particular card.',
    input_schema: {
      type: 'object' as const,
      properties: {
        card: {
          type: 'string',
          enum: ['csp', 'amex_gold', 'amex_platinum', 'venture_x'],
          description: 'Filter by specific card',
        },
        category: {
          type: 'string',
          description: 'Filter by category keyword (e.g. Dining, Groceries, Travel)',
        },
        from_date: { type: 'string', description: 'Start date YYYY-MM-DD' },
        to_date: { type: 'string', description: 'End date YYYY-MM-DD' },
        limit: { type: 'number', description: 'Max results (default 50)' },
      },
    },
  },
  {
    name: 'get_spending_by_category',
    description:
      'Get total spending aggregated by category. Use this to answer questions about how much was spent on dining, groceries, travel, etc., or to find where to cut spending.',
    input_schema: {
      type: 'object' as const,
      properties: {
        card: {
          type: 'string',
          enum: ['csp', 'amex_gold', 'amex_platinum', 'venture_x'],
          description: 'Filter by specific card',
        },
        from_date: { type: 'string', description: 'Start date YYYY-MM-DD' },
        to_date: { type: 'string', description: 'End date YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'get_monthly_spending',
    description:
      'Get spending totals grouped by month. Use this to show spending trends, compare months, or see if spending is going up or down.',
    input_schema: {
      type: 'object' as const,
      properties: {
        card: {
          type: 'string',
          enum: ['csp', 'amex_gold', 'amex_platinum', 'venture_x'],
        },
        months: { type: 'number', description: 'Number of recent months to include (default 6)' },
      },
    },
  },
  {
    name: 'get_top_merchants',
    description:
      'Get top merchants ranked by total spend. Use this to see where the most money is being spent, or to identify specific recurring expenses.',
    input_schema: {
      type: 'object' as const,
      properties: {
        card: {
          type: 'string',
          enum: ['csp', 'amex_gold', 'amex_platinum', 'venture_x'],
        },
        from_date: { type: 'string', description: 'Start date YYYY-MM-DD' },
        to_date: { type: 'string', description: 'End date YYYY-MM-DD' },
        limit: { type: 'number', description: 'Number of top merchants (default 10)' },
      },
    },
  },
  {
    name: 'get_benefits',
    description:
      'Get current benefit credit balances showing how much has been used and how much remains for each credit. Use this to check remaining Uber Cash, dining credits, travel credits, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        card: {
          type: 'string',
          enum: ['csp', 'amex_gold', 'amex_platinum', 'venture_x'],
          description: 'Filter by specific card (omit for all cards)',
        },
      },
    },
  },
  {
    name: 'get_card_recommendation',
    description:
      'Get the best card recommendation for a specific spending category or merchant. Use this when the user asks which card to use for a purchase.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description:
            'Category or merchant name (e.g. "groceries", "United Airlines", "Marriott hotel", "streaming")',
        },
      },
      required: ['query'],
    },
  },
]

const TOOL_LABELS: Record<string, string> = {
  get_transactions: 'Looking up transactions',
  get_spending_by_category: 'Analyzing spending by category',
  get_monthly_spending: 'Calculating monthly trends',
  get_top_merchants: 'Finding top merchants',
  get_benefits: 'Checking benefit balances',
  get_card_recommendation: 'Finding best card',
}

async function queryTxns(card?: string, fromDate?: string, toDate?: string, limit = 200) {
  let query = db.select().from(transactions).$dynamic()
  const filters = []
  if (card) filters.push(eq(transactions.card, card))
  if (fromDate) filters.push(gte(transactions.date, fromDate))
  if (toDate) filters.push(lte(transactions.date, toDate))
  if (filters.length > 0) query = query.where(and(...filters))
  return query.orderBy(desc(transactions.date)).limit(limit)
}

async function executeTool(name: string, input: Record<string, unknown>) {
  if (name === 'get_transactions') {
    const { card, from_date, to_date, limit, category } = input as {
      card?: string
      from_date?: string
      to_date?: string
      limit?: number
      category?: string
    }
    let rows = await queryTxns(card, from_date, to_date, limit ?? 50)
    if (category) {
      rows = rows.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()))
    }
    return rows
  }

  if (name === 'get_spending_by_category') {
    const { card, from_date, to_date } = input as {
      card?: string
      from_date?: string
      to_date?: string
    }
    const rows = await queryTxns(card, from_date, to_date)
    const grouped: Record<string, { total: number; count: number; pointsEarned: number }> = {}
    for (const t of rows) {
      if (!grouped[t.category]) grouped[t.category] = { total: 0, count: 0, pointsEarned: 0 }
      grouped[t.category].total += t.amount
      grouped[t.category].count += 1
      grouped[t.category].pointsEarned += t.pointsEarned ?? 0
    }
    const grandTotal = Object.values(grouped).reduce((s, v) => s + v.total, 0)
    return Object.entries(grouped)
      .map(([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        pct: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0,
        transactions: data.count,
        pointsEarned: data.pointsEarned,
      }))
      .sort((a, b) => b.total - a.total)
  }

  if (name === 'get_monthly_spending') {
    const { card, months = 6 } = input as { card?: string; months?: number }
    const from = new Date()
    from.setMonth(from.getMonth() - months)
    const fromDate = from.toISOString().split('T')[0]
    const rows = await queryTxns(card, fromDate)
    const grouped: Record<string, { total: number; count: number; pointsEarned: number }> = {}
    for (const t of rows) {
      const month = t.date.slice(0, 7)
      if (!grouped[month]) grouped[month] = { total: 0, count: 0, pointsEarned: 0 }
      grouped[month].total += t.amount
      grouped[month].count += 1
      grouped[month].pointsEarned += t.pointsEarned ?? 0
    }
    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        total: Math.round(data.total * 100) / 100,
        transactions: data.count,
        pointsEarned: data.pointsEarned,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  if (name === 'get_top_merchants') {
    const { card, from_date, to_date, limit = 10 } = input as {
      card?: string
      from_date?: string
      to_date?: string
      limit?: number
    }
    const rows = await queryTxns(card, from_date, to_date)
    const grouped: Record<string, { total: number; count: number; category: string }> = {}
    for (const t of rows) {
      if (!grouped[t.merchant]) grouped[t.merchant] = { total: 0, count: 0, category: t.category }
      grouped[t.merchant].total += t.amount
      grouped[t.merchant].count += 1
    }
    return Object.entries(grouped)
      .map(([merchant, data]) => ({
        merchant,
        total: Math.round(data.total * 100) / 100,
        visits: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  }

  if (name === 'get_benefits') {
    const { card } = input as { card?: string }
    let query = db.select().from(benefits).$dynamic()
    if (card) query = query.where(eq(benefits.card, card))
    const rows = await query
    return rows.map((b) => ({
      id: b.id,
      card: b.card,
      cardName: CARD_MAP[b.card as CardId]?.shortName ?? b.card,
      name: b.name,
      totalAmount: b.totalAmount,
      usedAmount: b.usedAmount ?? 0,
      remaining: Math.max(b.totalAmount - (b.usedAmount ?? 0), 0),
      cadence: b.cadence,
      periodKey: b.periodKey,
    }))
  }

  if (name === 'get_card_recommendation') {
    const { query } = input as { query: string }
    const recs = getCardRecommendations(query)
    return recs.map((r) => ({
      card: r.card.name,
      shortName: r.card.shortName,
      multiplier: r.multiplier,
      note: r.note,
      pointsCurrency: r.card.pointsCurrency,
    }))
  }

  return { error: 'Unknown tool' }
}

export async function POST(req: Request) {
  const { messages: clientMessages } = await req.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        const str = typeof data === 'string' ? data : JSON.stringify(data)
        controller.enqueue(encoder.encode(`data: ${str}\n\n`))
      }

      try {
        const msgs: Anthropic.MessageParam[] = clientMessages.map(
          (m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }),
        )

        // Agentic loop — keeps running until no more tool calls
        while (true) {
          const messageStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: TOOLS,
            messages: msgs,
          })

          // Stream text tokens as they arrive
          messageStream.on('text', (text: string) => {
            send({ delta: text })
          })

          const finalMsg = await messageStream.finalMessage()
          msgs.push({ role: 'assistant', content: finalMsg.content })

          if (finalMsg.stop_reason !== 'tool_use') break

          // Execute all tool calls and collect results
          const toolResults: Anthropic.ToolResultBlockParam[] = []
          for (const block of finalMsg.content) {
            if (block.type !== 'tool_use') continue
            send({ tool_call: block.name, label: TOOL_LABELS[block.name] ?? block.name })
            const result = await executeTool(block.name, block.input as Record<string, unknown>)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            })
          }
          msgs.push({ role: 'user', content: toolResults })
        }

        send('[DONE]')
      } catch (err) {
        console.error('Chat API error:', err)
        send({ delta: 'An error occurred. Please check your API key.' })
        send('[DONE]')
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
