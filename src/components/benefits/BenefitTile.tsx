'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Check } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { BenefitDef } from '@/data/cardDefinitions'

interface BenefitTileProps {
  benefit: BenefitDef
  benefitId: string
  usedAmount: number
  cardName: string
  onUpdate: (id: string, newAmount: number) => void
}

export function BenefitTile({ benefit, benefitId, usedAmount, cardName, onUpdate }: BenefitTileProps) {
  const [localUsed, setLocalUsed] = useState(usedAmount)
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync if parent changes (e.g. data reload)
  useEffect(() => {
    setLocalUsed(usedAmount)
  }, [usedAmount])

  const pct = Math.min((localUsed / benefit.amount) * 100, 100)
  const remaining = Math.max(benefit.amount - localUsed, 0)

  const barColor =
    pct < 30
      ? 'bg-green'
      : pct < 50
        ? 'bg-amber'
        : pct < 75
          ? 'bg-orange-500'
          : 'bg-rose'

  const cadenceLabel =
    benefit.cadence === 'monthly'
      ? 'monthly'
      : benefit.cadence === 'semi_annual'
        ? 'semi-annual'
        : 'annual'

  function handleSliderChange([value]: number[]) {
    setLocalUsed(value)
    setSaved(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(benefitId, value)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 500)
  }

  // Determine step granularity based on total amount
  const step = benefit.amount <= 20 ? 1 : benefit.amount <= 100 ? 5 : 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center shrink-0 mt-0.5">
          <Gift className="w-4 h-4 text-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-base">{benefit.name}</p>
          <p className="text-xs text-text-muted">{cardName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-0.5 text-[10px] font-medium text-green"
            >
              <Check className="w-3 h-3" /> Saved
            </motion.span>
          )}
          <span className="text-xs font-medium text-text-muted bg-surface-hi px-2 py-0.5 rounded-full">
            {cadenceLabel}
          </span>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted tabular">
          <span className={`font-semibold ${localUsed > 0 ? 'text-text-base' : ''}`}>
            ${localUsed.toFixed(0)}
          </span>{' '}
          used / ${benefit.amount.toFixed(0)} total
        </span>
        <span className={`font-medium tabular ${remaining === 0 ? 'text-rose' : 'text-green'}`}>
          {remaining === 0 ? 'Fully used' : `$${remaining.toFixed(0)} left`}
        </span>
      </div>

      {/* Progress bar (animated to localUsed) */}
      <div className="h-1.5 bg-surface-hi rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>

      {/* Slider */}
      <div className="pt-1 pb-0.5">
        <Slider
          min={0}
          max={benefit.amount}
          step={step}
          value={[localUsed]}
          onValueChange={handleSliderChange}
        />
      </div>

      {/* Tick labels */}
      <div className="flex items-center justify-between text-[10px] text-text-muted tabular -mt-1">
        <span>$0</span>
        <span>${(benefit.amount / 2).toFixed(0)}</span>
        <span>${benefit.amount.toFixed(0)}</span>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">{benefit.description}</p>
    </motion.div>
  )
}
