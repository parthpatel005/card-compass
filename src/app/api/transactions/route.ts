import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { transactions, NewTransaction } from '@/db/schema'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { CARD_MAP, CardId } from '@/data/cardDefinitions'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const card = searchParams.get('card')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = db.select().from(transactions).$dynamic()

  const filters = []
  if (card) filters.push(eq(transactions.card, card))
  if (from) filters.push(gte(transactions.date, from))
  if (to) filters.push(lte(transactions.date, to))
  if (filters.length > 0) query = query.where(and(...filters))

  const rows = await query.orderBy(desc(transactions.date)).limit(200)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { card, date, merchant, amount, category, notes } = body

  const cardDef = CARD_MAP[card as CardId]
  const rate = cardDef?.earningRates.find((r) =>
    r.category.toLowerCase().includes(category?.toLowerCase() ?? '')
  ) ?? cardDef?.earningRates.at(-1)

  const multiplier = rate?.multiplier ?? 1
  const pointsEarned = Math.round(amount * multiplier)

  const row: NewTransaction = {
    id: randomUUID(),
    card,
    date,
    merchant,
    amount,
    category,
    multiplier,
    pointsEarned,
    notes,
  }

  await db.insert(transactions).values(row)
  return NextResponse.json(row)
}
