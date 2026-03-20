'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'Which card should I use for groceries?',
  'How much Uber Cash do I have left on Platinum?',
  "What's my best card for my next flight?",
  'Show me my spending by category this month',
  'Where should I cut back on spending?',
  'What are my top merchants this month?',
]

interface ChatPanelProps {
  open: boolean
  onClose: () => void
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolLabel, setToolLabel] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.ok) throw new Error('Chat API error')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages((m) => [...m, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.tool_call) {
                setToolLabel(parsed.label ?? 'Thinking...')
              } else if (parsed.delta) {
                setToolLabel(null)
                assistantContent += parsed.delta
                setMessages((m) => {
                  const updated = [...m]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                  return updated
                })
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
      setToolLabel(null)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 z-50 w-[420px] flex flex-col bg-surface border-l border-white/[0.08] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-base">Claude</p>
                <p className="text-[10px] text-text-muted">Card rewards assistant</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-text-base transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted text-center py-4">
                  Ask me anything about your cards, rewards, or spending.
                </p>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left text-sm text-text-muted bg-surface-hi hover:bg-blue/10 hover:text-blue border border-white/[0.06] hover:border-blue/20 rounded-xl px-3 py-2.5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue text-white rounded-br-sm'
                      : 'bg-surface-hi text-text-base rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                  {msg.role === 'assistant' && loading && i === messages.length - 1 && !toolLabel && (
                    <span className="inline-block w-1 h-4 bg-blue ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            {toolLabel && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface-hi rounded-xl px-3 py-2">
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-blue animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 rounded-full bg-blue animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-1 rounded-full bg-blue animate-bounce [animation-delay:300ms]" />
                  </span>
                  {toolLabel}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.08]">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Ask about rewards, benefits, best card..."
                rows={1}
                className="resize-none bg-surface-hi border-white/[0.08] text-text-base placeholder:text-text-muted text-sm"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                size="sm"
                className="bg-blue hover:bg-blue/90 text-white shrink-0 h-9 w-9 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
