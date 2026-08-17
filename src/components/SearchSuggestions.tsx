import { ArrowUpRight, History, Search, Sparkles } from 'lucide-react'
import { BouncyAccordion } from './ui/be-ui-bouncy-accordion'
import { BorderBeam } from './ui/border-beam'
import { suggestions } from '../lib/search/suggestions'

interface SearchSuggestionsProps {
  recentSearches: string[]
  onPick: (query: string) => void
}

export default function SearchSuggestions({ recentSearches, onPick }: SearchSuggestionsProps) {
  const suggestionItems = suggestions.map((suggestion, index) => ({
    id: `suggestion-${index}`,
    title: suggestion,
    icon: <Search size={14} strokeWidth={1.8} />,
    description: (
      <div className="suggestion-detail">
        <p>从时间、事件和情绪里拼出一条更接近的记忆线索。</p>
        <button type="button" className="suggestion-use" onClick={() => onPick(suggestion)}>
          使用这条搜索
          <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    ),
  }))

  const recentItems = recentSearches.slice(0, 3).map((recent, index) => ({
    id: `recent-${index}`,
    title: recent,
    icon: <History size={14} strokeWidth={1.8} />,
    description: (
      <div className="suggestion-detail">
        <p>这条搜索只保存在当前设备，方便你继续回到那段记忆。</p>
        <button type="button" className="suggestion-use" onClick={() => onPick(recent)}>
          再次搜索
          <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    ),
  }))

  return (
    <BorderBeam className="suggestions-beam" size="md" colorVariant="colorful" theme="dark">
      <div className="suggestions-dropdown" role="region" aria-label="搜索建议">
        <div className="suggestions-dropdown-head">
          <p className="suggestions-dropdown-kicker"><Sparkles size={13} strokeWidth={1.8} /> Memory prompts</p>
          <span className="suggestions-dropdown-hint">展开一条线索</span>
        </div>

        <div className="suggestions-section">
          <p className="suggestions-section-label"><Search size={12} strokeWidth={1.8} /> Try searching</p>
          <BouncyAccordion
            items={suggestionItems}
            defaultValue={suggestionItems[0]?.id ?? null}
            className="suggestions-accordion"
            classNames={{
              root: 'suggestions-accordion-root',
              item: 'suggestions-accordion-item',
              trigger: 'suggestions-accordion-trigger',
              icon: 'suggestions-accordion-icon',
              title: 'suggestions-accordion-title',
              chevron: 'suggestions-accordion-chevron',
              content: 'suggestions-accordion-content',
              description: 'suggestions-accordion-description',
            }}
          />
        </div>

        <div className="suggestions-recent-section">
          <p className="suggestions-section-label"><History size={12} strokeWidth={1.8} /> Recent searches</p>
          {recentItems.length ? (
            <BouncyAccordion
              items={recentItems}
              className="suggestions-accordion"
              classNames={{
                root: 'suggestions-accordion-root',
                item: 'suggestions-accordion-item recent-accordion-item',
                trigger: 'suggestions-accordion-trigger',
                icon: 'suggestions-accordion-icon recent-accordion-icon',
                title: 'suggestions-accordion-title',
                chevron: 'suggestions-accordion-chevron',
                content: 'suggestions-accordion-content',
                description: 'suggestions-accordion-description',
              }}
            />
          ) : (
            <p className="suggestions-recent-empty">你的搜索会只保存在这台设备上。</p>
          )}
        </div>
      </div>
    </BorderBeam>
  )
}
