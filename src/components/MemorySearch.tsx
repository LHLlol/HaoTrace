import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchInput from './SearchInput'
import SearchSuggestions from './SearchSuggestions'

const RECENT_KEY = 'haotrace-recent-searches'

export function getRecentSearches() {
  try {
    const saved = localStorage.getItem(RECENT_KEY)
    return saved ? JSON.parse(saved) as string[] : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const next = [query, ...getRecentSearches().filter((item) => item !== query)].slice(0, 6)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

interface MemorySearchProps {
  initialQuery?: string
  compact?: boolean
  autoFocus?: boolean
  onSearchingChange?: (searching: boolean) => void
}

export default function MemorySearch({ initialQuery = '', compact = false, autoFocus = false, onSearchingChange }: MemorySearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery)
  const [recent, setRecent] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  useEffect(() => setRecent(getRecentSearches()), [])
  useEffect(() => setQuery(initialQuery), [initialQuery])

  function submit() {
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    setRecent(getRecentSearches())
    onSearchingChange?.(true)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function pick(nextQuery: string) {
    setQuery(nextQuery)
    if (!compact) setFocused(true)
    window.setTimeout(() => {
      saveRecentSearch(nextQuery)
      navigate(`/search?q=${encodeURIComponent(nextQuery)}`)
    }, compact ? 0 : 140)
  }

  return (
    <div className={`memory-search-wrap ${compact ? 'is-compact' : ''}`}>
      <SearchInput value={query} onChange={setQuery} onSubmit={submit} compact={compact} autoFocus={autoFocus} onFocus={() => setFocused(true)} onClear={() => setQuery('')} />
      {!compact && (focused || !query) && <SearchSuggestions recentSearches={recent} onPick={pick} />}
    </div>
  )
}
