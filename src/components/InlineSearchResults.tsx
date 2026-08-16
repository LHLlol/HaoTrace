import { AlertCircle, LoaderCircle } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SearchResult } from '../types/search'

interface InlineSearchResultsProps {
  query: string
  results: SearchResult[]
  searching: boolean
  error: boolean
  onRetry: () => void
}

function resultDate(date: string) {
  const [year, month, day] = date.split('-')
  return { year, day: `${month}.${day}` }
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
          <div className="inline-search-status">
            <LoaderCircle size={17} className="inline-search-loader" aria-hidden="true" />
            <span>正在寻找相关片段</span>
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
              {results.slice(0, 6).map((result, index) => {
                const date = resultDate(result.message.date)
                return (
                  <motion.article
                    className="inline-result"
                    key={result.message.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.045, duration: reduceMotion ? 0 : 0.28 }}
                  >
                    <div className="inline-result-date">
                      <span>{date.year}</span>
                      <strong>{date.day}</strong>
                    </div>
                    <div className="inline-result-copy">
                      <span>{result.conversation.title}</span>
                      <p>{result.message.content}</p>
                    </div>
                    <span className="inline-result-time">{result.message.timestamp.slice(11, 16)}</span>
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
