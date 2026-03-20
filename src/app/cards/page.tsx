'use client'

import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { CreditCardWidget } from '@/components/cards/CreditCardWidget'
import { CARDS } from '@/data/cardDefinitions'
import { Badge } from '@/components/ui/badge'

export default function CardsPage() {
  return (
    <AppShell title="My Cards" subtitle="4 travel cards tracked">
      <div className="space-y-8">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex gap-8">
              <CreditCardWidget card={card} />

              <div className="flex-1 space-y-5">
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold text-text-base">{card.name}</h2>
                  <p className="text-sm text-text-muted">
                    Annual fee: <span className="text-text-base font-medium">${card.annualFee}</span> ·{' '}
                    Points: <span className="text-text-base font-medium">{card.pointsCurrency}</span>
                  </p>
                </div>

                {/* Earning rates */}
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Earning Rates</p>
                  <div className="grid grid-cols-2 gap-2">
                    {card.earningRates.map((rate) => (
                      <div key={rate.category} className="flex items-center justify-between bg-surface-hi rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-text-base">{rate.category}</p>
                          {rate.note && <p className="text-[10px] text-text-muted">{rate.note}</p>}
                        </div>
                        <Badge
                          className={`ml-2 shrink-0 ${
                            rate.multiplier >= 5
                              ? 'bg-green/20 text-green border-green/20'
                              : rate.multiplier >= 3
                                ? 'bg-blue/20 text-blue border-blue/20'
                                : rate.multiplier >= 2
                                  ? 'bg-amber/20 text-amber border-amber/20'
                                  : 'bg-surface text-text-muted border-white/[0.08]'
                          }`}
                        >
                          {rate.multiplier}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits summary */}
                {card.benefits.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Annual Credits</p>
                    <div className="flex flex-wrap gap-2">
                      {card.benefits.map((b) => (
                        <div key={b.id} className="bg-surface-hi rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <span className="text-xs text-text-muted">{b.name}</span>
                          <span className="text-xs font-bold text-green">${b.amount}</span>
                          <span className="text-[10px] text-text-muted">/{b.cadence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  )
}
