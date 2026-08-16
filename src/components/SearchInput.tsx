import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { type FormEvent, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  autoFocus?: boolean
  compact?: boolean
  loading?: boolean
  onFocus?: () => void
  onClear?: () => void
}

export default function SearchInput({ value, onChange, onSubmit, placeholder = '我记得她以前好像说过……', autoFocus, compact = false, loading = false, onFocus, onClear }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (value.trim() && !loading) onSubmit()
  }

  return (
    <form className={`memory-search-input ${compact ? 'compact' : ''} ${loading ? 'is-loading' : ''}`} onSubmit={submit} role="search">
      <Search className="search-input-icon" size={compact ? 19 : 21} strokeWidth={1.7} aria-hidden="true" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        type="search"
        name="memory-query"
        placeholder={placeholder}
        aria-label="搜索模糊记忆"
        autoComplete="off"
        disabled={loading}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            if (value.trim() && !loading) onSubmit()
          }
        }}
      />
      {value && !loading && onClear && (
        <button className="clear-search" type="button" onClick={onClear} aria-label="清空搜索">
          <X size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
      <motion.button
        className="search-submit"
        type="submit"
        aria-label="开始搜索"
        whileHover={{ scale: 1.04, rotate: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        disabled={loading}
      >
        {compact ? <ArrowUpRight size={18} strokeWidth={1.7} /> : <SlidersHorizontal size={17} strokeWidth={1.7} />}
      </motion.button>
      {loading && <span className="search-loading-dot" role="status" aria-label="正在搜索" aria-live="polite" />}
    </form>
  )
}
