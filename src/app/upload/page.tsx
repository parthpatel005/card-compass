'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { CARDS, CardId } from '@/data/cardDefinitions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Check, Loader2, AlertCircle } from 'lucide-react'

interface ParsedTransaction {
  date: string
  merchant: string
  amount: number
  category: string
}

export default function UploadPage() {
  const [card, setCard] = useState<CardId | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<string>('idle')
  const [parsed, setParsed] = useState<ParsedTransaction[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file || !card) return
    setStatus('parsing')

    const form = new FormData()
    form.append('file', file)
    form.append('card', card)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Parse failed')
      setParsed(data.transactions)
      setStatus('review')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  async function handleSave() {
    if (!card) return
    setStatus('saving')
    for (const txn of parsed) {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txn, card }),
      })
    }
    setStatus('done')
  }

  function reset() {
    setFile(null)
    setParsed([])
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <AppShell title="Upload Statement" subtitle="Import transactions from a PDF bill">
      <div className="max-w-2xl space-y-6">
        {/* Card selector */}
        <div className="glass rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-text-base">1. Select your card</p>
          <Select value={card} onValueChange={(v) => setCard(v as CardId)}>
            <SelectTrigger className="bg-surface-hi border-white/[0.08] text-text-base">
              <SelectValue placeholder="Choose a card..." />
            </SelectTrigger>
            <SelectContent className="bg-surface border-white/[0.08]">
              {CARDS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        <div className="glass rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-text-base">2. Upload PDF statement</p>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const dropped = e.dataTransfer.files[0]
              if (dropped?.type === 'application/pdf') setFile(dropped)
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragging ? 'border-blue bg-blue/5' : 'border-white/[0.15] hover:border-white/30'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-base">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">Drop PDF here or click to browse</p>
              </>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !card || status === 'parsing'}
            className="w-full bg-blue hover:bg-blue/90 text-white"
          >
            {status === 'parsing' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing with Claude...</>
            ) : (
              'Parse Statement'
            )}
          </Button>
        </div>

        {/* Review */}
        <AnimatePresence>
          {status === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-base">
                  3. Review {parsed.length} extracted transactions
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={reset}
                    className="border-white/[0.08] text-text-muted hover:text-text-base">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={false}
                    className="bg-green hover:bg-green/90 text-white">
                    <><Check className="w-4 h-4 mr-1" /> Save All</>
                  </Button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1">
                {parsed.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-sm text-text-base">{t.merchant}</p>
                      <p className="text-xs text-text-muted">{t.date} · {t.category}</p>
                    </div>
                    <p className="text-sm font-semibold tabular text-text-base">${t.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-8 text-center border border-green/20"
            >
              <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green" />
              </div>
              <p className="text-base font-semibold text-text-base">
                {parsed.length} transactions saved!
              </p>
              <Button variant="outline" size="sm" onClick={reset} className="mt-4 border-white/[0.08] text-text-muted">
                Upload another
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-xl p-5 border border-rose/20 flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose">Parse failed</p>
                <p className="text-xs text-text-muted mt-1">{errorMsg}</p>
                <Button variant="outline" size="sm" onClick={reset} className="mt-3 border-white/[0.08] text-text-muted">
                  Try again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
