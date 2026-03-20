'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
  onChatToggle: () => void
  chatOpen: boolean
}

export function Header({ title, subtitle, onChatToggle, chatOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.08]">
      <div>
        <h1 className="text-2xl font-semibold text-text-base">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onChatToggle}
        className={`gap-2 border-white/[0.08] ${
          chatOpen ? 'bg-blue/10 text-blue border-blue/30' : 'text-text-muted hover:text-text-base'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        Ask Claude
      </Button>
    </header>
  )
}
