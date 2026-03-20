'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { CARDS } from '@/data/cardDefinitions'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

interface Transaction {
  id: string
  card: string
  date: string
  merchant: string
  amount: number
  category: string
  pointsEarned: number
}

const COLORS = ['#4f8ef7', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#06b6d4', '#84cc16', '#fb923c']

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetch('/api/transactions').then((r) => r.json()).then(setTransactions).catch(() => {})
  }, [])

  // Spend by category
  const byCategory = Object.entries(
    transactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)

  // Spend by card
  const byCard = CARDS.map((card) => ({
    name: card.shortName,
    spend: parseFloat(transactions.filter((t) => t.card === card.id).reduce((s, t) => s + t.amount, 0).toFixed(2)),
    points: transactions.filter((t) => t.card === card.id).reduce((s, t) => s + t.pointsEarned, 0),
  }))

  // Monthly trend
  const byMonth = Object.entries(
    transactions.reduce<Record<string, number>>((acc, t) => {
      const month = t.date.slice(0, 7)
      acc[month] = (acc[month] ?? 0) + t.amount
      return acc
    }, {})
  ).map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month))

  if (transactions.length === 0) {
    return (
      <AppShell title="Analytics" subtitle="Spending insights">
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">
          No transaction data yet. Upload a statement to see analytics.
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Analytics" subtitle="Spending insights across all cards">
      <div className="grid grid-cols-2 gap-6">
        {/* Spend by card */}
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Spend by Card</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCard}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spend']}
              />
              <Bar dataKey="spend" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by category */}
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Spend by Category</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spend']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        {byMonth.length > 1 && (
          <div className="glass rounded-xl p-5 col-span-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Monthly Spend Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={byMonth}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spend']}
                />
                <Line type="monotone" dataKey="amount" stroke="#4f8ef7" strokeWidth={2} dot={{ fill: '#4f8ef7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Points by card */}
        <div className="glass rounded-xl p-5 col-span-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Points Earned by Card</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCard}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }}
                formatter={(v) => [Number(v).toLocaleString(), 'Points']}
              />
              <Bar dataKey="points" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  )
}
