import { ArrowUpRight, History, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export const suggestions = [
  '她以前什么时候说过想去旅行？',
  '找一下她安慰我找工作的聊天',
  '我们什么时候第一次聊到养猫？',
  '找一下 2024 年夏天关于工作的聊天',
]

interface SearchSuggestionsProps {
  recentSearches: string[]
  onPick: (query: string) => void
}

export default function SearchSuggestions({ recentSearches, onPick }: SearchSuggestionsProps) {
  return (
    <div className="suggestions-grid">
      <div className="suggestions-column">
        <p className="eyebrow small-eyebrow"><Search size={13} strokeWidth={1.7} /> Try searching</p>
        <div className="suggestion-list">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              className="suggestion-button"
              onClick={() => onPick(suggestion)}
              initial={{ opacity: 0, x: -7 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 + index * 0.06, duration: 0.38 }}
              whileHover={{ x: 4, color: '#e45f4f' }}
            >
              <span>{suggestion}</span>
              <ArrowUpRight size={15} strokeWidth={1.6} />
            </motion.button>
          ))}
        </div>
      </div>
      <div className="suggestions-column recent-column">
        <p className="eyebrow small-eyebrow"><History size={13} strokeWidth={1.7} /> Recent memories</p>
        {recentSearches.length > 0 ? (
          <div className="recent-list">
            {recentSearches.slice(0, 3).map((recent) => (
              <button key={recent} className="recent-chip" onClick={() => onPick(recent)}>
                <span className="recent-dot" />
                {recent}
              </button>
            ))}
          </div>
        ) : (
          <p className="recent-empty">Your searches will stay here,<br />only on this device.</p>
        )}
      </div>
    </div>
  )
}
