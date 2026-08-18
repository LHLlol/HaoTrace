interface AiLoaderProps {
  label?: string
  detail?: string
  className?: string
}

export function AiLoader({
  label = '正在梳理这段记忆',
  detail = '内容 · 语境 · 时间',
  className = '',
}: AiLoaderProps) {
  return (
    <div
      className={`ai-loader ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={`${label}，${detail}`}
    >
      <div className="loader" aria-hidden="true" />
    </div>
  )
}

export default AiLoader
