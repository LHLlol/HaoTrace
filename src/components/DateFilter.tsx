import { CalendarDays, ChevronDown } from 'lucide-react'

interface DateFilterProps {
  value?: number
  onChange: (year?: number) => void
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const years = [undefined, 2023, 2024, 2025, 2022]
  return (
    <div className="date-filter" aria-label="按年份筛选">
      <CalendarDays size={15} strokeWidth={1.6} />
      <span className="date-filter-label">Time</span>
      <div className="date-filter-options">
        {years.map((year) => (
          <button key={year ?? 'any'} className={value === year ? 'selected' : ''} onClick={() => onChange(year)}>
            {year ?? 'Any time'}
          </button>
        ))}
      </div>
      <ChevronDown className="date-chevron" size={14} strokeWidth={1.7} />
    </div>
  )
}
