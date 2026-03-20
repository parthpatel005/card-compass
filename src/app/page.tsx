'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { CreditCardWidget } from '@/components/cards/CreditCardWidget'
import { CategoryOptimizer } from '@/components/optimizer/CategoryOptimizer'
import { CARDS } from '@/data/cardDefinitions'
import { TrendingUp, Gift, ArrowLeftRight, AlertCircle } from 'lucide-react'

interface Benefit {
  id: string
  card: string
  name: string
  totalAmount: number
  usedAmount: number
  cadence: string
  periodKey: string
}

interface Transaction {
  id: string
  card: string
  date: string
  merchant: string
  amount: number
  category: string
  pointsEarned: number
  multiplier: number
}

export default function Dashboard() {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetch('/api/benefits').then((r) => r.json()).then(setBenefits).catch(() => {})
    fetch('/api/transactions').then((r) => r.json()).then(setTransactions).catch(() => {})
  }, [])

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0)
  const totalPoints = transactions.reduce((s, t) => s + t.pointsEarned, 0)
  const unusedBenefits = benefits.filter((b) => b.usedAmount === 0)
  const totalBenefitValue = benefits.reduce((s, b) => s + b.totalAmount, 0)
  const usedBenefitValue = benefits.reduce((s, b) => s + b.usedAmount, 0)

  return (
    <AppShell title="Dashboard" subtitle="Your credit card rewards at a glance">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: ArrowLeftRight, color: 'text-blue' },
          { label: 'Points Earned', value: totalPoints.toLocaleString(), icon: TrendingUp, color: 'text-green' },
          { label: 'Benefits Used', value: `$${usedBenefitValue.toFixed(0)} / $${totalBenefitValue.toFixed(0)}`, icon: Gift, color: 'text-amber' },
          { label: 'Unclaimed Credits', value: unusedBenefits.length.toString(), icon: AlertCircle, color: 'text-rose' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-2xl font-bold tabular text-text-base">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cards */}
        <div className="col-span-2 space-y-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">My Cards</p>
          <div className="flex flex-wrap gap-4">
            {CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <CreditCardWidget card={card} />
              </motion.div>
            ))}
          </div>

          {/* Recent transactions */}
          <div className="glass rounded-xl p-5 mt-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Recent Transactions</p>
            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                No transactions yet. Upload a statement to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text-base">{t.merchant}</p>
                      <p className="text-xs text-text-muted">{t.date} · {CARDS.find(c => c.id === t.card)?.shortName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular text-text-base">-${t.amount.toFixed(2)}</p>
                      <p className="text-xs text-green">{t.multiplier}x → {t.pointsEarned.toLocaleString()} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Quick Tools</p>
          <CategoryOptimizer />

          {unusedBenefits.length > 0 && (
            <div className="glass rounded-xl p-4 border border-amber/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber" />
                <p className="text-sm font-medium text-text-base">Unclaimed Credits</p>
              </div>
              <div className="space-y-2">
                {unusedBenefits.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">{b.name}</p>
                    <span className="text-xs font-semibold text-amber tabular">${b.totalAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
