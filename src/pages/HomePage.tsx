import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InteractiveDots from '../components/ui/interactive-dots'
import QuestionBox from '../components/QuestionBox'
import InlineSearchResults from '../components/InlineSearchResults'
import LogoMark from '../components/LogoMark'
import { searchProvider } from '../lib/search'
import type { SearchResult } from '../types/search'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomePage() {
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(false)

  const search = () => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) return

    setSubmittedQuery(normalizedQuery)
    setSearchAttempt((attempt) => attempt + 1)
    setSearching(true)
    setError(false)
    setResults([])
  }

  useEffect(() => {
    if (!submittedQuery) return
    let alive = true
    searchProvider.search(submittedQuery, { contextSize: 1 }).then((nextResults) => {
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
  }, [submittedQuery, searchAttempt])

  const clearSearch = () => {
    setQuery('')
    setSubmittedQuery('')
    setResults([])
    setSearching(false)
    setError(false)
  }

  return (
    <div className="dots-home">
      <a className="skip-link" href="#memory-search">跳到搜索框</a>
      <Link to="/" className="minimal-corner-mark" aria-label="返回首页">
        <LogoMark />
      </Link>
      <InteractiveDots spacing={34} dotRadius={6} repelForce={1} repelDistance={18000} returnSpeed={1.1} />

      <div className="minimal-stage">
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
          className={`minimal-search${submittedQuery ? ' has-results' : ''}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
        >
          <QuestionBox value={query} onChange={setQuery} onSubmit={search} />
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
