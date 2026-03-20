'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  Gift,
  LayoutDashboard,
  Upload,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cards', label: 'My Cards', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/benefits', label: 'Benefits', icon: Gift },
  { href: '/optimizer', label: 'Optimizer', icon: Zap },
  { href: '/upload', label: 'Upload Statement', icon: Upload },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r border-white/[0.08] bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/[0.08]">
        <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-text-base tracking-tight">CardMaxx</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue/10 text-blue border-l-2 border-blue pl-[10px]'
                    : 'text-text-muted hover:text-text-base hover:bg-surface-hi'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/[0.08]">
        <p className="text-xs text-text-muted">Personal · 4 cards tracked</p>
      </div>
    </aside>
  )
}
