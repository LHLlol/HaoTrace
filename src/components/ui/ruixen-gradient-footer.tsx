import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

export type GradientStop = { offset: number; color: string }

const VIEWBOX_WIDTH = 1271
const VIEWBOX_HEIGHT = 599

export const HAOTRACE_GRADIENT_STOPS: GradientStop[] = [
  { offset: 0, color: '#08060f' },
  { offset: 0.18, color: '#1a1038' },
  { offset: 0.34, color: '#51239c' },
  { offset: 0.5, color: '#c26dff' },
  { offset: 0.66, color: '#66e3ff' },
  { offset: 0.82, color: '#e4c8ff' },
  { offset: 1, color: '#e4c8ff00' },
]

function bellHeights(columns: number, peak: number, valley: number) {
  const heights: number[] = []
  const middle = (columns - 1) / 2

  for (let index = 0; index < columns; index += 1) {
    const distance = middle === 0 ? 0 : Math.abs(index - middle) / middle
    const eased = 1 - Math.pow(distance, 1.24)
    heights.push(VIEWBOX_HEIGHT * peak * (valley + (1 - valley) * eased))
  }

  return heights
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export interface RuixenGradientFooterProps {
  children?: ReactNode
  gradientHeight?: string
  minReveal?: number
  bars?: number
  blur?: number
  peak?: number
  valley?: number
  stops?: GradientStop[]
  className?: string
  style?: CSSProperties
}

/** A footer whose ambient accent rises into view as the user reaches the page end. */
export function RuixenGradientFooter({
  children,
  gradientHeight = '42vh',
  minReveal = 0.035,
  bars = 11,
  blur = 17,
  peak = 0.8,
  valley = 0.42,
  stops = HAOTRACE_GRADIENT_STOPS,
  className,
  style,
}: RuixenGradientFooterProps) {
  const uid = useId().replace(/:/g, '')
  const bandRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(minReveal)

  useEffect(() => {
    const element = bandRef.current
    if (!element) return

    const documentRef = element.ownerDocument
    const windowRef = documentRef.defaultView ?? window
    const measure = () => {
      const height = element.offsetHeight || 1
      const scrollLeft = documentRef.documentElement.scrollHeight - windowRef.innerHeight - windowRef.scrollY
      const reveal = clamp01((height - scrollLeft) / height)
      setProgress(minReveal + (1 - minReveal) * reveal)
    }

    measure()
    windowRef.addEventListener('scroll', measure, { passive: true })
    windowRef.addEventListener('resize', measure, { passive: true })

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(measure)
    resizeObserver?.observe(element)

    return () => {
      windowRef.removeEventListener('scroll', measure)
      windowRef.removeEventListener('resize', measure)
      resizeObserver?.disconnect()
    }
  }, [minReveal])

  const columnWidth = VIEWBOX_WIDTH / bars

  return (
    <footer
      className={className}
      aria-label="网站页脚"
      style={{ paddingBottom: gradientHeight, ...style }}
    >
      {children}

      <div
        ref={bandRef}
        className="footer-gradient-band"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: gradientHeight,
          pointerEvents: 'none',
          transformOrigin: 'bottom',
          transform: `scaleY(${progress})`,
          willChange: 'transform',
        }}
      >
        <svg
          style={{ height: '100%', width: '100%', display: 'block' }}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`haotrace-footer-gradient-${uid}`} x1="0" y1="1" x2="0" y2="0">
              {stops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            <filter id={`haotrace-footer-blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>

          {bellHeights(bars, peak, valley).map((barHeight, index) => (
            <g key={index} filter={`url(#haotrace-footer-blur-${uid})`}>
              <rect
                x={index * columnWidth}
                y={VIEWBOX_HEIGHT - barHeight}
                width={columnWidth * 1.24}
                height={barHeight}
                fill={`url(#haotrace-footer-gradient-${uid})`}
              />
            </g>
          ))}
        </svg>
      </div>
    </footer>
  )
}
