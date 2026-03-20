'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { CARDS, getCardRecommendations } from '@/data/cardDefinitions'
import { Input } from '@/components/ui/input'
import { Search, Zap } from 'lucide-react'

const QUICK_CATEGORIES = [
  'Dining', 'Groceries', 'Flights', 'Hotels', 'Streaming',
  'Rental Car', 'Uber', 'Streaming', 'Travel', 'Shopping',
]

export default function OptimizerPage() {
  const [query, setQuery] = useState('')

  const results = query.trim().length > 1 ? getCardRecommendations(query) : []

  // Full comparison table
  const categories = [
    { label: 'Dining / Restaurants', query: 'restaurant' },
    { label: 'US Supermarkets', query: 'grocery' },
    { label: 'Flights (Direct)', query: 'flight' },
    { label: 'Hotels', query: 'hotel' },
    { label: 'Streaming', query: 'streaming' },
    { label: 'Rental Cars', query: 'rental car' },
    { label: 'Uber / Lyft', query: 'uber' },
    { label: 'Everything Else', query: 'other' },
  ]

  return (
    <AppShell title="Card Optimizer" subtitle="Find the best card for every purchase">
      <div className="grid grid-cols-2 gap-8">
        {/* Left: search */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber" />
              <p className="text-sm font-medium text-text-base">Search any merchant or category</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="e.g. Whole Foods, Delta, Netflix..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-surface-hi border-white/[0.08] text-text-base placeholder:text-text-muted"
              />
            </div>

            {/* Quick pills */}
            <div className="flex flex-wrap gap-2">
              {QUICK_CATEGORIES.filter((v, i, a) => a.indexOf(v) === i).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQuery(cat)}
                  className="text-xs text-text-muted bg-surface-hi hover:bg-blue/10 hover:text-blue border border-white/[0.06] hover:border-blue/20 rounded-full px-3 py-1 transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {results.length > 0 && (
                <motion.div
                  key={query}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 pt-2 border-t border-white/[0.08]"
                >
                  <p className="text-xs text-text-muted mb-2">Recommendations for "{query}"</p>
                  {results.map((rec, i) => (
                    <motion.div
                      key={rec.card.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        i === 0 ? 'bg-blue/10 border border-blue/20' : 'bg-surface-hi'
                      }`}
                    >
                      <div>
                        {i === 0 && (
                          <span className="text-[10px] font-semibold text-blue uppercase tracking-wider block mb-0.5">
                            Best Choice
                          </span>
                        )}
                        <p className="text-sm font-semibold text-text-base">{rec.card.name}</p>
                        {rec.note && <p className="text-xs text-text-muted mt-0.5">{rec.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green tabular">{rec.multiplier}x</p>
                        <p className="text-xs text-text-muted">{rec.card.pointsCurrency.split(' ')[0]}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: full comparison table */}
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Full Category Comparison</p>
          <div className="glass rounded-xl overflow-hidden">
            <div className={`grid gap-2 px-4 py-3 border-b border-white/[0.08]`}
              style={{ gridTemplateColumns: '1fr repeat(4, 60px)' }}>
              <p className="text-xs text-text-muted">Category</p>
              {CARDS.map((c) => (
                <p key={c.id} className="text-xs text-text-muted text-center">{c.shortName}</p>
              ))}
            </div>
            {categories.map(({ label, query: q }) => {
              const recs = getCardRecommendations(q)
              const bestMultiplier = Math.max(...recs.map((r) => r.multiplier))
              return (
                <div
                  key={label}
                  className="grid gap-2 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-surface-hi/40 transition-colors"
                  style={{ gridTemplateColumns: '1fr repeat(4, 60px)' }}
                >
                  <p className="text-sm text-text-base">{label}</p>
                  {CARDS.map((card) => {
                    const rec = recs.find((r) => r.card.id === card.id)
                    const mult = rec?.multiplier ?? 1
                    const isBest = mult === bestMultiplier && mult > 1
                    return (
                      <p
                        key={card.id}
                        className={`text-sm font-bold tabular text-center ${
                          isBest ? 'text-green' : mult > 1 ? 'text-text-base' : 'text-text-muted'
                        }`}
                      >
                        {mult}x
                      </p>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
