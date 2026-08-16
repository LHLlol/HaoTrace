import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Bookmark, Check, Clock3, LoaderCircle, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import MemorySearch from '../components/MemorySearch'
import MemoryLandscape from '../components/MemoryLandscape'
import MemoryResultCard from '../components/MemoryResultCard'
import DateFilter from '../components/DateFilter'
import EmptyMemoryState from '../components/EmptyMemoryState'
import { searchProvider } from '../lib/search'
import { getRecentSearches } from '../components/MemorySearch'
import type { SearchResult } from '../types/search'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(true)
  const [error, setError] = useState(false)
  const [year, setYear] = useState<number | undefined>(undefined)
  const [saved, setSaved] = useState(false)
  const reduceMotion = useReducedMotion()
  const recent = useMemo(() => getRecentSearches(), [query])

  useEffect(() => {
    let alive = true
    setSearching(true)
    setError(false)
    searchProvider.search(query, { year, contextSize: 2 }).then((nextResults) => {
      if (!alive) return
      setResults(nextResults)
      window.setTimeout(() => alive && setSearching(false), reduceMotion ? 0 : 440)
    }).catch(() => {
      if (!alive) return
      setResults([])
      setError(true)
      setSearching(false)
    })
    return () => { alive = false }
  }, [query, year, reduceMotion])

  function updateQuery(next: string) {
    setParams(next ? { q: next } : {})
  }

  return (
    <div className="search-page page-content">
      <section className="search-page-head">
        <div className="search-head-copy">
          <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the beginning</Link>
          <p className="eyebrow"><Search size={14} /> Memory search</p>
          <h1>让过去<br /><i>慢慢浮现。</i></h1>
        </div>
        <div className="search-page-input"><MemorySearch initialQuery={query} compact autoFocus /></div>
        <div className="search-page-landscape"><MemoryLandscape compact /></div>
      </section>

      <section className="results-section">
        <div className="results-toolbar">
          <div>
            <span className="eyebrow small-eyebrow"><Clock3 size={13} /> The memory shelf</span>
            <h2>{searching ? 'Looking through the archive…' : results.length ? <><span>{results.length}</span> pieces of context</> : 'Nothing came up this time'}</h2>
          </div>
          <div className="results-actions">
            <DateFilter value={year} onChange={setYear} />
            <button className={`save-search ${saved ? 'saved' : ''}`} onClick={() => setSaved((value) => !value)}><Bookmark size={14} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save search'}</button>
          </div>
        </div>

        <div className="query-breadcrumb"><span>remembering</span><strong>“{query || 'something from before'}”</strong><span className="breadcrumb-dot" />{!searching && <span>{year ? `filtered to ${year}` : 'all years'}</span>}</div>

        <AnimatePresence mode="wait">
          {searching ? (
            <motion.div key="searching" className="searching-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoaderCircle className="loader-spin" size={22} strokeWidth={1.5} />
              <span>Searching memories…</span>
              <div className="searching-dashes"><i /><i /><i /><i /></div>
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="search-error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="eyebrow small-eyebrow">A small interruption</p>
              <h2>这次没有成功打开记忆索引。</h2>
              <p>请稍后再试。你的聊天内容不会因此离开这台设备。</p>
              <button onClick={() => setParams({ q: query })}>Try again</button>
            </motion.div>
          ) : results.length ? (
            <motion.div key="results" className="results-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {results.map((result, index) => <MemoryResultCard key={result.message.id} result={result} query={query} index={index} />)}
              <div className="results-end-note"><Check size={14} /> That’s everything close to this memory, for now.</div>
            </motion.div>
          ) : (
            <EmptyMemoryState key="empty" onPick={updateQuery} />
          )}
        </AnimatePresence>
      </section>

      <section className="search-footnote">
        <div><span className="footnote-mark">*</span><span>HaoTrace searches by meaning, not just exact words.<br />This local memory index can later be swapped for another data source.</span></div>
        <div className="search-recent-mini">{recent.slice(0, 2).map((item) => <button key={item} onClick={() => updateQuery(item)}>↗ {item}</button>)}</div>
      </section>
    </div>
  )
}
