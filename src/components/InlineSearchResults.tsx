import { AlertCircle } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SearchResult } from '../types/search'

interface InlineSearchResultsProps {
  query: string
  results: SearchResult[]
  searching: boolean
  error: boolean
  onRetry: () => void
}

export default function InlineSearchResults({ query, results, searching, error, onRetry }: InlineSearchResultsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.section
        key={searching ? 'loading' : error ? 'error' : results.length ? 'results' : 'empty'}
        className="inline-search-results"
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-live="polite"
      >
        {searching ? (
          <div className="inline-search-status memory-search-thinking" role="status" aria-live="polite">
            <span className="memory-thinking-visual" aria-hidden="true">
              <span className="memory-thinking-dot" />
              <span className="memory-thinking-dot" />
              <span className="memory-thinking-dot" />
            </span>
            <span className="memory-thinking-copy">
              <strong>正在梳理这段记忆</strong>
              <small>内容 · 语境 · 时间</small>
            </span>
          </div>
        ) : error ? (
          <div className="inline-search-status inline-search-error">
            <AlertCircle size={17} aria-hidden="true" />
            <span>暂时无法打开记忆索引</span>
            <button type="button" onClick={onRetry}>再试一次</button>
          </div>
        ) : results.length ? (
          <>
            <div className="inline-search-summary">
              <span>找到 {results.length} 条相关片段</span>
              <span className="inline-search-query">“{query}”</span>
            </div>
            <div className="inline-result-list">
              {results.map((result, index) => {
                const animateRow = !reduceMotion && index < 24
                return (
                  <motion.article
                    className="inline-result"
                    key={result.message.id}
                    initial={animateRow ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: animateRow ? Math.min(index * 0.018, 0.18) : 0, duration: animateRow ? 0.28 : 0 }}
                  >
                    <div className="inline-result-copy">
                      <p>{result.message.content}</p>
                    </div>
                    <time className="inline-result-meta" dateTime={result.message.timestamp}>
                      <span>{result.message.date}</span>
                      <strong>{result.message.timestamp.slice(11, 16)}</strong>
                    </time>
                  </motion.article>
                )
              })}
            </div>
          </>
        ) : (
          <div className="inline-search-status inline-search-empty">
            <span>还没有找到与“{query}”接近的片段</span>
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  )
}
