import { ArrowUp, AtSign, Sparkles } from 'lucide-react'
import { type FormEvent, useRef } from 'react'
import { BorderBeam } from './ui/border-beam'

interface QuestionBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFocus?: () => void
}

export default function QuestionBox({ value, onChange, onSubmit, onFocus }: QuestionBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim()) {
      inputRef.current?.focus()
      return
    }
    onSubmit()
  }

  return (
    <BorderBeam className="question-beam" size="md" colorVariant="colorful" theme="dark" aria-label="浩迹记忆搜索">
      <form className="question-box" id="memory-search" onSubmit={handleSubmit}>
        <div className="question-box-topline" aria-hidden="true">
          <span className="question-box-chip" aria-hidden="true">
            <AtSign size={15} strokeWidth={1.6} />
          </span>
          <span className="question-box-kicker">
            <Sparkles size={12} strokeWidth={1.8} />
            Search a memory
          </span>
        </div>

        <div className={`question-box-editor${value ? ' has-value' : ''}`}>
          <span className="question-box-caret" aria-hidden="true" />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type="search"
            name="memory-query"
            placeholder="我记得她以前好像说过……"
            aria-label="描述你想找的聊天记忆"
            autoComplete="off"
            enterKeyHint="search"
            onFocus={onFocus}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (value.trim()) onSubmit()
              }
            }}
          />
        </div>

        <div className="question-box-footer">
          <span>Describe what happened</span>
          <button className="question-submit" type="submit" aria-label="搜索记忆">
            <ArrowUp size={17} strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </BorderBeam>
  )
}
