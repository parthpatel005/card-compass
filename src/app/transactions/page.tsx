'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { CARDS } from '@/data/cardDefinitions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cardFilter, setCardFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = cardFilter !== 'all' ? `?card=${cardFilter}` : ''
    fetch(`/api/transactions${params}`).then((r) => r.json()).then(setTransactions).catch(() => {})
  }, [cardFilter])

  const filtered = transactions.filter(
    (t) =>
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell title="Transactions" subtitle={`${filtered.length} transactions`}>
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search merchant or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-hi border-white/[0.08] text-text-base placeholder:text-text-muted"
          />
        </div>
        <Select value={cardFilter} onValueChange={(v) => setCardFilter(v ?? 'all')}>
          <SelectTrigger className="w-44 bg-surface-hi border-white/[0.08] text-text-base">
            <SelectValue placeholder="All cards" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-white/[0.08]">
            <SelectItem value="all">All cards</SelectItem>
            {CARDS.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.shortName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.08]">
          {['Merchant', 'Card', 'Category', 'Amount', 'Points'].map((h) => (
            <p key={h} className="text-xs font-medium text-text-muted uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">
            No transactions yet. Upload a PDF statement to import them.
          </p>
        ) : (
          filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-[1fr_120px_120px_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-surface-hi/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text-base">{t.merchant}</p>
                <p className="text-xs text-text-muted">{t.date}</p>
              </div>
              <p className="text-sm text-text-muted self-center">
                {CARDS.find((c) => c.id === t.card)?.shortName ?? t.card}
              </p>
              <span className="self-center inline-flex">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-hi text-text-muted">
                  {t.category}
                </span>
              </span>
              <p className="text-sm font-semibold tabular text-text-base self-center">
                ${t.amount.toFixed(2)}
              </p>
              <div className="self-center">
                <p className="text-xs font-bold text-green tabular">{t.pointsEarned.toLocaleString()}</p>
                <p className="text-[10px] text-text-muted">{t.multiplier}x</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </AppShell>
  )
}
