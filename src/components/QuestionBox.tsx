import { ArrowUp, Sparkles } from 'lucide-react'
import { type FormEvent, useRef } from 'react'
import type { SearchRound } from '../lib/search/rounds'
import { BorderBeam } from './ui/border-beam'
import DateRangePicker from './DateRangePicker'
import RoundPicker from './RoundPicker'

interface QuestionBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFocus?: () => void
  startDate?: string
  endDate?: string
  onDateRangeChange: (startDate?: string, endDate?: string) => void
  onDatePickerOpenChange?: (open: boolean) => void
  selectedRound?: SearchRound
  onRoundSelect: (roundId?: SearchRound) => void
  onRoundPickerOpenChange?: (open: boolean) => void
  developerMode?: boolean
}

export default function QuestionBox({ value, onChange, onSubmit, onFocus, startDate, endDate, onDateRangeChange, onDatePickerOpenChange, selectedRound, onRoundSelect, onRoundPickerOpenChange, developerMode = false }: QuestionBoxProps) {
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
        <div className="question-box-topline">
          <RoundPicker selectedRound={selectedRound} onSelect={onRoundSelect} onOpenChange={onRoundPickerOpenChange} />
          <span className="question-box-kicker">
            <Sparkles size={12} strokeWidth={1.8} />
            {developerMode ? 'Developer mode' : 'Search a memory'}
          </span>
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={onDateRangeChange} onOpenChange={onDatePickerOpenChange} />
        </div>

        <div className={`question-box-editor${value ? ' has-value' : ''}`}>
          <span className="question-box-caret" aria-hidden="true" />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type="search"
            name="memory-query"
            placeholder={developerMode ? '仅提交 TXT 文件，不执行搜索反馈' : '我记得她以前好像说过……'}
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
          <span>{developerMode ? 'Input muted · TXT only' : 'Describe what happened'}</span>
          <button className="question-submit" type="submit" aria-label="搜索记忆">
            <ArrowUp size={17} strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </BorderBeam>
  )
}
