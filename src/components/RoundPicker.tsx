import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AtSign, CalendarRange, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ROUND_PRESETS, type SearchRound } from '../lib/search/rounds'
import { BorderBeam } from './ui/border-beam'

interface RoundPickerProps {
  selectedRound?: SearchRound
  onSelect: (roundId?: SearchRound) => void
  onOpenChange?: (open: boolean) => void
}

export default function RoundPicker({ selectedRound, onSelect, onOpenChange }: RoundPickerProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)

  function closePicker() {
    setOpen(false)
    onOpenChange?.(false)
  }

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePicker()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function togglePicker() {
    const nextOpen = !open
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  function selectRound(roundId: SearchRound) {
    onSelect(roundId)
    closePicker()
  }

  function clearRound() {
    onSelect(undefined)
    closePicker()
  }

  return (
    <div className="round-picker">
      <button
        type="button"
        className={`question-box-chip round-picker-trigger${selectedRound ? ' is-active' : ''}`}
        aria-label="选择时间阶段"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="快速选择 @round 时间阶段"
        onClick={togglePicker}
      >
        <AtSign size={15} strokeWidth={1.6} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="round-picker-popover-wrap"
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: .98 }}
            transition={{ duration: reduceMotion ? 0 : .2, ease: [0.22, 1, 0.36, 1] }}
          >
            <BorderBeam className="round-picker-beam" size="md" colorVariant="colorful" theme="dark">
              <div className="round-picker-popover" role="dialog" aria-label="选择搜索时间阶段">
                <div className="round-picker-header">
                  <div>
                    <span>时间阶段</span>
                    <strong>快速标注 @round</strong>
                  </div>
                  <button type="button" className="round-picker-close" aria-label="关闭时间阶段选择" onClick={closePicker}>
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                <p className="round-picker-hint">选择后会把标记写入搜索框，并同步限定日期。</p>

                <div className="round-picker-options">
                  {ROUND_PRESETS.map((round) => (
                    <button
                      type="button"
                      key={round.id}
                      className={`round-picker-option${selectedRound === round.id ? ' selected' : ''}`}
                      aria-pressed={selectedRound === round.id}
                      onClick={() => selectRound(round.id)}
                    >
                      <span className="round-picker-option-icon"><CalendarRange size={14} strokeWidth={1.7} aria-hidden="true" /></span>
                      <span className="round-picker-option-copy">
                        <strong>{round.label} <code>{round.token}</code></strong>
                        <small>{round.description}</small>
                      </span>
                      {selectedRound === round.id && <Check size={14} strokeWidth={1.9} aria-hidden="true" />}
                    </button>
                  ))}
                </div>

                <div className="round-picker-footer">
                  <button type="button" className="round-picker-clear" disabled={!selectedRound} onClick={clearRound}>清除阶段</button>
                  <span>也可直接输入 @round1 / @round2</span>
                </div>
              </div>
            </BorderBeam>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
