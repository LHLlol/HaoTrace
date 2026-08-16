import { ArrowUpRight, CalendarDays, MessageCircle, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { SearchResult } from '../types/search'

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return { year, day: `${month}.${day}` }
}

function scoreLabel(score: number) {
  if (score > 0.78) return 'Strongly related'
  if (score > 0.52) return 'Related memory'
  return 'A soft connection'
}

export default function MemoryResultCard({ result, query, index = 0 }: { result: SearchResult; query: string; index?: number }) {
  const reduceMotion = useReducedMotion()
  const date = formatDate(result.message.date)
  const hitIndex = result.context.findIndex((message) => message.id === result.message.id)
  return (
    <motion.article
      className={`memory-result-card tone-${result.conversation.coverTone ?? 'coral'}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
    >
      <div className="result-date-rail">
        <span className="result-date-year">{date.year}</span>
        <strong>{date.day}</strong>
        <span>{result.message.timestamp.slice(11, 16)}</span>
        <span className="result-rail-line" />
      </div>
      <div className="result-main">
        <div className="result-topline">
          <div className="result-meta">
            <span className="result-meta-icon"><CalendarDays size={13} strokeWidth={1.6} /></span>
            <span>{result.conversation.title}</span>
          </div>
          <span className="result-match"><Sparkles size={12} strokeWidth={1.6} /> {Math.round(result.scores.final * 100)}% · {scoreLabel(result.scores.final)}</span>
        </div>
        <div className="result-context">
          {result.context.map((message, contextIndex) => {
            const isHit = contextIndex === hitIndex
            return (
              <div key={message.id} className={`preview-message ${isHit ? 'hit' : ''} ${message.sender === '我' ? 'mine' : ''}`}>
                <span className="preview-sender">{message.sender}</span>
                <p>{message.content}</p>
                {isHit && <span className="hit-mark">记忆命中</span>}
              </div>
            )
          })}
        </div>
        <div className="result-footer">
          <div className="result-tags">
            {(result.matchedConcepts.length ? result.matchedConcepts : result.conversation.topics ?? []).slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}
            <span className="result-query">“{query.length > 15 ? `${query.slice(0, 15)}…` : query}”</span>
          </div>
          <Link className="view-memory-link" to={`/conversation/${result.conversation.id}?message=${result.message.id}`}>
            <MessageCircle size={15} strokeWidth={1.7} /> View memory <ArrowUpRight size={15} strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
