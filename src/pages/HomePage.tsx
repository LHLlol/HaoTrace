import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InteractiveDots from '../components/ui/interactive-dots'
import QuestionBox from '../components/QuestionBox'
import InlineSearchResults from '../components/InlineSearchResults'
import SearchSuggestions from '../components/SearchSuggestions'
import LogoMark from '../components/LogoMark'
import DeveloperPanel from '../components/DeveloperPanel'
import CircularCarousel, { type CarouselItem } from '../components/ui/circular-carousel'
import AiLoader from '../components/ui/ai-loader'
import { searchProvider } from '../lib/search'
import { appendRoundToken, getRoundPreset, removeRoundToken, type SearchRound } from '../lib/search/rounds'
import { suggestions } from '../lib/search/suggestions'
import type { SearchResult } from '../types/search'

const ease = [0.22, 1, 0.36, 1] as const
const MIN_SEARCH_STATE_MS = 680

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
  const [secondaryPanelOpen, setSecondaryPanelOpen] = useState(false)
  const [selectedRound, setSelectedRound] = useState<SearchRound | undefined>()
  const [developerMode, setDeveloperMode] = useState(false)
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
    if (developerMode || searching) return
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
    if (!submittedQuery || developerMode) return
    const roundPreset = getRoundPreset(submittedQuery)
    const hasUnsubmittedQuery = query.trim() !== submittedQuery.trim()
    const effectiveStartDate = roundPreset?.startDate ?? (hasUnsubmittedQuery ? undefined : startDate)
    const effectiveEndDate = roundPreset?.endDate ?? (hasUnsubmittedQuery ? undefined : endDate)
    const signature = `${submittedQuery}\u0000${effectiveStartDate ?? ''}\u0000${effectiveEndDate ?? ''}\u0000${searchAttempt}`
    if (lastSearchSignature.current === signature) return
    lastSearchSignature.current = signature
    let alive = true
    let finishTimer: number | undefined
    const startedAt = Date.now()

    const finishSearch = (nextResults: SearchResult[], nextError = false) => {
      const applyResult = () => {
        if (!alive) return
        setResults(nextResults)
        setSearching(false)
        setError(nextError)
      }
      const remaining = Math.max(0, MIN_SEARCH_STATE_MS - (Date.now() - startedAt))
      if (remaining) finishTimer = window.setTimeout(applyResult, remaining)
      else applyResult()
    }

    searchProvider.search(submittedQuery, { contextSize: 1, startDate: effectiveStartDate, endDate: effectiveEndDate }).then((nextResults) => {
      if (!alive) return
      finishSearch(nextResults)
    }).catch(() => {
      if (!alive) return
      finishSearch([], true)
    })
    return () => {
      alive = false
      if (finishTimer !== undefined) window.clearTimeout(finishTimer)
    }
  }, [developerMode, query, reduceMotion, submittedQuery, searchAttempt, startDate, endDate])

  const handleQueryChange = (value: string) => {
    if (!developerMode && value.trim() === '///') {
      setDeveloperMode(true)
      setQuery('')
      setSubmittedQuery('')
      setSearchAttempt(0)
      setResults([])
      setSearching(false)
      setError(false)
      setSuggestionsOpen(false)
      setSecondaryPanelOpen(false)
      setStartDate(undefined)
      setEndDate(undefined)
      setSelectedRound(undefined)
      return
    }
    if (developerMode) {
      setQuery(value)
      return
    }
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
    setSecondaryPanelOpen(false)
    setSelectedRound(undefined)
    setDeveloperMode(false)
    lastSearchSignature.current = ''
    setRecentSearches([])
    localStorage.removeItem('haotrace-recent-searches')
    navigate('/')
  }

  const pickSuggestion = (nextQuery: string) => {
    setQuery(nextQuery)
    setSuggestionsOpen(true)
  }

  const memoryItems: CarouselItem[] = [
    {
      id: 'memory-travel',
      title: '她什么时候说过想去旅行？',
      description: '从一句轻轻带过的愿望，回到那段还没出发的夏天。',
      tag: 'travel / 01',
    },
    {
      id: 'memory-work',
      title: '找一下她安慰我找工作的聊天',
      description: '把那次被接住的语气，和当时的上下文一起找回来。',
      tag: 'work / 02',
    },
    {
      id: 'memory-cat',
      title: '我们第一次聊到养猫',
      description: '一条关于猫咪的消息，也许藏着关系开始变软的时刻。',
      tag: 'home / 03',
    },
    {
      id: 'memory-summer',
      title: '2024 年夏天关于工作的聊天',
      description: '用时间把模糊的搜索收拢，先找回季节，再找回原话。',
      tag: 'time / 04',
    },
    {
      id: 'memory-late-night',
      title: '那段熬夜之后的对话',
      description: '从情绪、时间和语境里，拼出一条更接近的记忆线索。',
      tag: 'mood / 05',
    },
    ...recentSearches.slice(0, 2).map((recent, index) => ({
      id: `recent-memory-${index}-${recent}`,
      title: recent,
      description: '这条线索来自你最近的搜索，点击即可再次放回问题框。',
      tag: `recent / 0${index + 6}`,
    })),
  ]

  const pickMemory = (nextQuery: string) => {
    setQuery(nextQuery)
    setSubmittedQuery('')
    setResults([])
    setError(false)
    setSuggestionsOpen(true)
    lastSearchSignature.current = ''
    window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('#memory-search input')
      input?.focus({ preventScroll: true })
      document.querySelector('#memory-search')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    }, 0)
  }

  return (
    <div className={`dots-home${searching ? ' is-searching' : ''}`} aria-busy={searching}>
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
      <InteractiveDots paused={searching} spacing={34} dotRadius={6} repelForce={1} repelDistance={18000} returnSpeed={1.1} />

      <AnimatePresence>
        {searching && (
          <motion.div
            className="search-focus-overlay"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: [1, 1, 0] }}
            transition={{ duration: reduceMotion ? 0 : 0.36, ease }}
          >
            <motion.div
              className="search-focus-light"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? { opacity: 0.46 } : { opacity: [0, 0.84, 0.42] }}
              exit={reduceMotion ? undefined : { opacity: [0.42, 0.18, 0] }}
              transition={{ duration: reduceMotion ? 0 : 0.36, ease }}
            />
            <motion.div
              className="search-focus-light-core"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.2 }}
              animate={{ opacity: reduceMotion ? 0.5 : [0, 0.8, 0.36], scale: reduceMotion ? 1 : [0.2, 1, 0.92] }}
              exit={reduceMotion ? undefined : { opacity: [0.36, 0.48, 0], scale: [0.92, 0.38, 0.04] }}
              transition={{ duration: reduceMotion ? 0 : 0.36, ease }}
            />
            <motion.div
              className="search-focus-orb"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: [1, 1, 0], scale: [1, 0.9, 0.78] }}
              transition={{ duration: reduceMotion ? 0 : 0.36, ease }}
            >
              <AiLoader />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className={`minimal-search${submittedQuery ? ' has-results' : ''}${secondaryPanelOpen ? ' secondary-panel-open' : ''}${developerMode ? ' developer-mode' : ''}${searching ? ' is-searching' : ''}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
        >
          <QuestionBox
            value={query}
            onChange={handleQueryChange}
            onSubmit={search}
            loading={searching}
            onFocus={() => {
              if (!developerMode) setSuggestionsOpen(true)
            }}
            developerMode={developerMode}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            onDatePickerOpenChange={(open) => {
              setSecondaryPanelOpen(open)
              if (open) setSuggestionsOpen(false)
            }}
            selectedRound={selectedRound}
            onRoundSelect={handleRoundSelect}
            onRoundPickerOpenChange={(open) => {
              setSecondaryPanelOpen(open)
              if (open) setSuggestionsOpen(false)
            }}
          />
          {developerMode && (
            <DeveloperPanel
              onImport={async (payload) => {
                await searchProvider.importConversations?.(payload.conversations)
                setSubmittedQuery('')
                setResults([])
                setSearching(false)
                setError(false)
              }}
            />
          )}
          {!developerMode && suggestionsOpen && !submittedQuery && (
            <SearchSuggestions recentSearches={recentSearches} onPick={pickSuggestion} />
          )}
          {!developerMode && submittedQuery && (
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

      {!developerMode && (
        <motion.section
          className={`memory-atlas${(suggestionsOpen || submittedQuery) ? ' is-pushed-down' : ''}`}
          aria-label="记忆搜索菜单"
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: reduceMotion ? 0 : 0.72, ease }}
        >
          <div className="memory-atlas-orbit">
            <CircularCarousel items={memoryItems} onItemSelect={(item) => pickMemory(item.title)} />
          </div>
        </motion.section>
      )}
    </div>
  )
}
