'use client'

import { motion } from 'framer-motion'
import { CardDef } from '@/data/cardDefinitions'

interface CreditCardWidgetProps {
  card: CardDef
  balance?: number
  limit?: number
}

const NETWORK_BADGE: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
}

export function CreditCardWidget({ card, balance = 0, limit = 10000 }: CreditCardWidgetProps) {
  const utilization = limit > 0 ? (balance / limit) * 100 : 0
  const utilizationColor =
    utilization < 30
      ? 'bg-green'
      : utilization < 50
        ? 'bg-amber'
        : utilization < 75
          ? 'bg-orange-500'
          : 'bg-rose'

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative w-72 h-44 rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-2xl overflow-hidden select-none cursor-pointer`}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-12 w-40 h-40 rounded-full bg-white/5" />

      {/* Top row */}
      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
            {card.shortName}
          </p>
          <p className="text-sm font-semibold text-white mt-0.5 leading-tight">{card.name}</p>
        </div>
        <span className="text-xs font-bold text-white/80 bg-white/10 px-2 py-1 rounded">
          {NETWORK_BADGE[card.network]}
        </span>
      </div>

      {/* Balance */}
      <div className="relative mb-3">
        <p className="text-2xl font-bold text-white tabular">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-white/50">Current Balance</p>
      </div>

      {/* Utilization bar */}
      <div className="relative">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full ${utilizationColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-white/40 mt-1">{utilization.toFixed(0)}% utilized</p>
      </div>
    </motion.div>
  )
}
