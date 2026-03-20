'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { BenefitTile } from '@/components/benefits/BenefitTile'
import { CARDS } from '@/data/cardDefinitions'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Benefit {
  id: string
  card: string
  name: string
  totalAmount: number
  usedAmount: number
  cadence: string
  periodKey: string
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([])

  useEffect(() => {
    fetch('/api/benefits').then((r) => r.json()).then(setBenefits).catch(() => {})
  }, [])

  async function handleBenefitUpdate(id: string, newAmount: number) {
    await fetch('/api/benefits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, usedAmount: newAmount }),
    })
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, usedAmount: newAmount } : b)))
  }

  const totalValue = benefits.reduce((s, b) => s + b.totalAmount, 0)
  const usedValue = benefits.reduce((s, b) => s + b.usedAmount, 0)

  return (
    <AppShell
      title="Benefits Tracker"
      subtitle={`$${usedValue.toFixed(0)} captured of $${totalValue.toFixed(0)} available`}
    >
      <Tabs defaultValue="all">
        <TabsList className="bg-surface-hi mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {CARDS.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>{c.shortName}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((b) => {
              const cardDef = CARDS.find((c) => c.id === b.card)
              const benefitDef = cardDef?.benefits.find((bd) => b.id.startsWith(bd.id))
              if (!benefitDef || !cardDef) return null
              return (
                <BenefitTile
                  key={b.id}
                  benefit={benefitDef}
                  benefitId={b.id}
                  usedAmount={b.usedAmount}
                  cardName={cardDef.shortName}
                  onUpdate={handleBenefitUpdate}
                />
              )
            })}
          </div>
        </TabsContent>

        {CARDS.map((card) => (
          <TabsContent key={card.id} value={card.id}>
            <div className="grid grid-cols-2 gap-4">
              {benefits
                .filter((b) => b.card === card.id)
                .map((b) => {
                  const benefitDef = card.benefits.find((bd) => b.id.startsWith(bd.id))
                  if (!benefitDef) return null
                  return (
                    <BenefitTile
                      key={b.id}
                      benefit={benefitDef}
                      benefitId={b.id}
                      usedAmount={b.usedAmount}
                      cardName={card.shortName}
                      onUpdate={handleBenefitUpdate}
                    />
                  )
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  )
}
