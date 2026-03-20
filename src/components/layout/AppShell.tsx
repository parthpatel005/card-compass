'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatPanel } from '@/components/chat/ChatPanel'

interface AppShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60 min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onChatToggle={() => setChatOpen((o) => !o)}
          chatOpen={chatOpen}
        />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
