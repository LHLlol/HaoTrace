import { CalendarDays, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { BorderBeam } from './ui/border-beam'

const MIN_DATE = '2025-11-08'
const MAX_DATE = '2026-08-16'
const MIN_MONTH = MIN_DATE.slice(0, 7)
const MAX_MONTH = MAX_DATE.slice(0, 7)
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate?: string, endDate?: string) => void
  onOpenChange?: (open: boolean) => void
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month + 1)}`
}

function parseMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return { year, month: month - 1 }
}

function shiftMonth(value: string, offset: number) {
  const { year, month } = parseMonth(value)
  const next = new Date(year, month + offset, 1)
  return monthKey(next.getFullYear(), next.getMonth())
}

function formatMonth(value: string) {
  const { year, month } = parseMonth(value)
  return `${year}年${month + 1}月`
}

function formatDate(value?: string) {
  if (!value) return ''
  const [, month, day] = value.split('-')
  return `${Number(month)}月${Number(day)}日`
}

function formatRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return '不限日期'
  if (!startDate && endDate) return `截至 ${formatDate(endDate)}`
  if (startDate && !endDate) return `${formatDate(startDate)} 起`
  if (!endDate || startDate === endDate) return formatDate(startDate)
  return `${formatDate(startDate)} – ${formatDate(endDate)}`
}

function isBetween(value: string, startDate?: string, endDate?: string) {
  return Boolean(startDate && endDate && value > startDate && value < endDate)
}

export default function DateRangePicker({ startDate, endDate, onChange, onOpenChange }: DateRangePickerProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(MAX_MONTH)
  const [draftStart, setDraftStart] = useState(startDate)
  const [draftEnd, setDraftEnd] = useState(endDate)
  const [activeField, setActiveField] = useState<'start' | 'end'>('start')

  useEffect(() => {
    setDraftStart(startDate)
    setDraftEnd(endDate)
    if (startDate) setVisibleMonth(startDate.slice(0, 7))
    if (startDate && !endDate) setActiveField('end')
  }, [startDate, endDate])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePicker()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const days = useMemo(() => {
    const { year, month } = parseMonth(visibleMonth)
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: firstDay + daysInMonth }, (_, index) => {
      if (index < firstDay) return null
      const day = index - firstDay + 1
      return toDateKey(year, month, day)
    })
  }, [visibleMonth])

  const hasSelection = Boolean(startDate || endDate)

  function closePicker() {
    setOpen(false)
    onOpenChange?.(false)
  }

  function handleDayClick(value: string) {
    if (value < MIN_DATE || value > MAX_DATE) return

    if (activeField === 'start' || !draftStart) {
      setDraftStart(value)
      if (draftEnd && value > draftEnd) setDraftEnd(undefined)
      setActiveField('end')
      return
    }

    if (value < draftStart) {
      setDraftStart(value)
      setDraftEnd(undefined)
      setActiveField('end')
      return
    }

    setDraftEnd(value)
    setActiveField('start')
  }

  function selectField(field: 'start' | 'end') {
    setActiveField(field)
    const selectedDate = field === 'start' ? draftStart : draftEnd
    if (selectedDate) setVisibleMonth(selectedDate.slice(0, 7))
  }

  function applyRange() {
    if (!draftStart) return
    onChange(draftStart, draftEnd)
    closePicker()
  }

  function clearRange() {
    setDraftStart(undefined)
    setDraftEnd(undefined)
    onChange(undefined, undefined)
    closePicker()
  }

  function openPicker() {
    setDraftStart(startDate)
    setDraftEnd(endDate)
    setVisibleMonth(startDate?.slice(0, 7) ?? MAX_MONTH)
    const nextOpen = !open
    setActiveField(startDate && !endDate ? 'end' : 'start')
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  return (
    <div className="date-range-control">
      <button
        type="button"
        className={`date-range-trigger${hasSelection ? ' is-active' : ''}`}
        aria-label="限定搜索日期"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={openPicker}
      >
        <CalendarDays size={12} strokeWidth={1.8} aria-hidden="true" />
        <span>{hasSelection ? formatRange(startDate, endDate) : 'Any date'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="date-range-popover-wrap"
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <BorderBeam className="date-range-beam" size="md" colorVariant="colorful" theme="dark">
              <div className="date-range-popover" role="dialog" aria-label="选择搜索日期范围">
                <div className="date-range-header">
                  <div>
                    <span>限定日期</span>
                    <strong>{formatRange(draftStart, draftEnd)}</strong>
                  </div>
                  <button type="button" className="date-range-close" aria-label="关闭日期选择" onClick={() => setOpen(false)}>
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                <div className="date-range-fields" aria-live="polite">
                  <button type="button" className={`date-range-field${draftStart ? ' selected' : ''}${activeField === 'start' ? ' active' : ''}`} aria-label="选择开始日期" aria-pressed={activeField === 'start'} onClick={() => selectField('start')}>
                    {draftStart ? `开始 ${formatDate(draftStart)}` : '选择开始日期'}
                  </button>
                  <i />
                  <button type="button" className={`date-range-field${draftEnd ? ' selected' : ''}${activeField === 'end' ? ' active' : ''}`} aria-label="选择结束日期" aria-pressed={activeField === 'end'} onClick={() => selectField('end')}>
                    {draftEnd ? `结束 ${formatDate(draftEnd)}` : '再选结束日期'}
                  </button>
                </div>

                <div className="calendar-toolbar">
                  <button type="button" aria-label="上一个月" disabled={visibleMonth <= MIN_MONTH} onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}>
                    <ChevronLeft size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <strong>{formatMonth(visibleMonth)}</strong>
                  <button type="button" aria-label="下一个月" disabled={visibleMonth >= MAX_MONTH} onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}>
                    <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                <div className="calendar-grid">
                  {WEEKDAYS.map((weekday) => <span key={weekday} className="calendar-weekday">{weekday}</span>)}
                  {days.map((value, index) => {
                    const disabled = !value || value < MIN_DATE || value > MAX_DATE
                    const selected = value === draftStart || value === draftEnd
                    const inRange = value ? isBetween(value, draftStart, draftEnd) : false
                    return (
                      <button
                        type="button"
                        key={value ?? `empty-${index}`}
                        className={`calendar-day${selected ? ' selected' : ''}${inRange ? ' in-range' : ''}`}
                        disabled={disabled}
                        aria-label={value ?? undefined}
                        aria-pressed={selected}
                        onClick={() => value && handleDayClick(value)}
                      >
                        {value ? Number(value.slice(-2)) : ''}
                      </button>
                    )
                  })}
                </div>

                <div className="date-range-footer">
                  <button type="button" className="date-range-clear" disabled={!draftStart && !draftEnd} onClick={clearRange}>清除</button>
                  <button type="button" className="date-range-apply" disabled={!draftStart} onClick={applyRange}>
                    <Check size={13} strokeWidth={1.9} aria-hidden="true" />
                    应用范围
                  </button>
                </div>
              </div>
            </BorderBeam>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
