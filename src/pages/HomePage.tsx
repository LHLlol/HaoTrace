import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InteractiveDots from '../components/ui/interactive-dots'
import QuestionBox from '../components/QuestionBox'
import InlineSearchResults from '../components/InlineSearchResults'
import SearchSuggestions from '../components/SearchSuggestions'
import LogoMark from '../components/LogoMark'
import { searchProvider } from '../lib/search'
import { appendRoundToken, getRoundPreset, removeRoundToken, type SearchRound } from '../lib/search/rounds'
import type { SearchResult } from '../types/search'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomePage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [selectedRound, setSelectedRound] = useState<SearchRound | undefined>()
  const lastSearchSignature = useRef('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('haotrace-recent-searches')
      if (saved) setRecentSearches(JSON.parse(saved) as string[])
    } catch {
      setRecentSearches([])
    }
  }, [])

  const rememberSearch = (value: string) => {
    const next = [value, ...recentSearches.filter((item) => item !== value)].slice(0, 6)
    setRecentSearches(next)
    localStorage.setItem('haotrace-recent-searches', JSON.stringify(next))
  }

  const search = () => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) return

    rememberSearch(normalizedQuery)
    setSubmittedQuery(normalizedQuery)
    setSearchAttempt((attempt) => attempt + 1)
    setSearching(true)
    setError(false)
    setResults([])
  }

  useEffect(() => {
    if (!submittedQuery) return
    const roundPreset = getRoundPreset(submittedQuery)
    const hasUnsubmittedQuery = query.trim() !== submittedQuery.trim()
    const effectiveStartDate = roundPreset?.startDate ?? (hasUnsubmittedQuery ? undefined : startDate)
    const effectiveEndDate = roundPreset?.endDate ?? (hasUnsubmittedQuery ? undefined : endDate)
    const signature = `${submittedQuery}\u0000${effectiveStartDate ?? ''}\u0000${effectiveEndDate ?? ''}\u0000${searchAttempt}`
    if (lastSearchSignature.current === signature) return
    lastSearchSignature.current = signature
    let alive = true
    searchProvider.search(submittedQuery, { contextSize: 1, startDate: effectiveStartDate, endDate: effectiveEndDate }).then((nextResults) => {
      if (!alive) return
      setResults(nextResults)
      setSearching(false)
    }).catch(() => {
      if (!alive) return
      setResults([])
      setSearching(false)
      setError(true)
    })
    return () => { alive = false }
  }, [query, submittedQuery, searchAttempt, startDate, endDate])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    const roundPreset = getRoundPreset(value)
    if (roundPreset) {
      setSelectedRound(roundPreset.id)
      setStartDate(roundPreset.startDate)
      setEndDate(roundPreset.endDate)
    } else if (selectedRound) {
      setSelectedRound(undefined)
      setStartDate(undefined)
      setEndDate(undefined)
    }
  }

  const handleRoundSelect = (roundId?: SearchRound) => {
    if (!roundId) {
      setSelectedRound(undefined)
      setStartDate(undefined)
      setEndDate(undefined)
      setQuery(removeRoundToken)
      return
    }

    const roundPreset = getRoundPreset(`@${roundId}`)
    setSelectedRound(roundId)
    setStartDate(roundPreset?.startDate)
    setEndDate(roundPreset?.endDate)
    setQuery((current) => appendRoundToken(current, roundId))
    setSuggestionsOpen(false)
  }

  const handleDateRangeChange = (nextStartDate?: string, nextEndDate?: string) => {
    setSelectedRound(undefined)
    setStartDate(nextStartDate)
    setEndDate(nextEndDate)
    setQuery(removeRoundToken)
  }

  const resetSearch = () => {
    setQuery('')
    setSubmittedQuery('')
    setSearchAttempt(0)
    setResults([])
    setSearching(false)
    setError(false)
    setSuggestionsOpen(false)
    setStartDate(undefined)
    setEndDate(undefined)
    setDatePickerOpen(false)
    setSelectedRound(undefined)
    lastSearchSignature.current = ''
    setRecentSearches([])
    localStorage.removeItem('haotrace-recent-searches')
    navigate('/')
  }

  const pickSuggestion = (nextQuery: string) => {
    setQuery(nextQuery)
    setSuggestionsOpen(true)
  }

  return (
    <div className="dots-home">
      <a className="skip-link" href="#memory-search">跳到搜索框</a>
      <Link
        to="/"
        className="minimal-corner-mark"
        aria-label="重置搜索并回到首页"
        title="重置搜索并清空记录"
        onClick={(event) => {
          event.preventDefault()
          resetSearch()
        }}
      >
        <LogoMark />
      </Link>
      <InteractiveDots spacing={34} dotRadius={6} repelForce={1} repelDistance={18000} returnSpeed={1.1} />

      <div className={`minimal-stage${suggestionsOpen && !submittedQuery ? ' has-suggestions' : ''}`}>
        <motion.h1
          className="minimal-title"
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease }}
        >
          <span className="minimal-title-cn">浩迹</span>
          <span className="minimal-title-en">HaoTrace</span>
        </motion.h1>

        <motion.div
          className={`minimal-search${submittedQuery ? ' has-results' : ''}${datePickerOpen ? ' date-picker-open' : ''}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
        >
          <QuestionBox
            value={query}
            onChange={handleQueryChange}
            onSubmit={search}
            onFocus={() => setSuggestionsOpen(true)}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            onDatePickerOpenChange={(open) => {
              setDatePickerOpen(open)
              if (open) setSuggestionsOpen(false)
            }}
            selectedRound={selectedRound}
            onRoundSelect={handleRoundSelect}
            onRoundPickerOpenChange={(open) => {
              setDatePickerOpen(open)
              if (open) setSuggestionsOpen(false)
            }}
          />
          {suggestionsOpen && !submittedQuery && (
            <SearchSuggestions recentSearches={recentSearches} onPick={pickSuggestion} />
          )}
          {submittedQuery && (
            <InlineSearchResults
              query={submittedQuery}
              results={results}
              searching={searching}
              error={error}
              onRetry={search}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
