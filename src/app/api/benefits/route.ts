import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { benefits, NewBenefit } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { CARDS } from '@/data/cardDefinitions'

function getPeriodKey(cadence: string): string {
  const now = new Date()
  if (cadence === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  if (cadence === 'semi_annual') {
    return `${now.getFullYear()}-${now.getMonth() < 6 ? 'H1' : 'H2'}`
  }
  return String(now.getFullYear())
}

// Seed benefits for current period if not exists
async function seedBenefits() {
  for (const card of CARDS) {
    for (const benefit of card.benefits) {
      const periodKey = getPeriodKey(benefit.cadence)
      const existing = await db
        .select()
        .from(benefits)
        .where(and(eq(benefits.id, `${benefit.id}_${periodKey}`)))
      if (existing.length === 0) {
        const row: NewBenefit = {
          id: `${benefit.id}_${periodKey}`,
          card: card.id,
          name: benefit.name,
          totalAmount: benefit.amount,
          usedAmount: 0,
          cadence: benefit.cadence,
          periodKey,
        }
        await db.insert(benefits).values(row).onConflictDoNothing()
      }
    }
  }
}

export async function GET() {
  await seedBenefits()
  const rows = await db.select().from(benefits)
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const { id, usedAmount } = await req.json()
  await db.update(benefits).set({ usedAmount }).where(eq(benefits.id, id))
  return NextResponse.json({ ok: true })
}
