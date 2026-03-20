'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getCardRecommendations } from '@/data/cardDefinitions'

export function CategoryOptimizer() {
  const [query, setQuery] = useState('')

  const results = query.trim().length > 1 ? getCardRecommendations(query) : []

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber" />
        <p className="text-sm font-medium text-text-base">Which card should I use?</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Type a merchant or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-surface-hi border-white/[0.08] text-text-base placeholder:text-text-muted"
        />
      </div>

      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key={query}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {results.map((rec, i) => (
              <motion.div
                key={rec.card.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                  i === 0 ? 'bg-blue/10 border border-blue/20' : 'bg-surface-hi'
                }`}
              >
                <div>
                  {i === 0 && (
                    <span className="text-[10px] font-semibold text-blue uppercase tracking-wider block mb-0.5">
                      Best
                    </span>
                  )}
                  <p className="text-sm font-medium text-text-base">{rec.card.name}</p>
                  {rec.note && <p className="text-xs text-text-muted">{rec.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green tabular">{rec.multiplier}x</p>
                  <p className="text-xs text-text-muted">{rec.card.pointsCurrency.split(' ')[0]}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
