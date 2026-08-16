import { ArrowUpRight, SearchX } from 'lucide-react'
import { motion } from 'framer-motion'
import { suggestions } from './SearchSuggestions'

export default function EmptyMemoryState({ onPick }: { onPick: (query: string) => void }) {
  return (
    <motion.div className="empty-memory" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="empty-doodle"><SearchX size={42} strokeWidth={1.15} /><span>?</span></div>
      <p className="eyebrow small-eyebrow">A quiet corner</p>
      <h2>这段记忆还没有浮现。</h2>
      <p>换一种说法，也许我们就能找到它。可以描述事情、情绪，或者当时的大概时间。</p>
      <div className="empty-suggestions">
        {suggestions.slice(0, 3).map((suggestion) => (
          <button key={suggestion} onClick={() => onPick(suggestion)}>{suggestion}<ArrowUpRight size={14} /></button>
        ))}
      </div>
    </motion.div>
  )
}
