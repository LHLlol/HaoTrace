import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface CarouselItem {
  id: string
  title: string
  description: string
  tag?: string
}

export interface CircularCarouselProps {
  items: CarouselItem[]
  activeIndex?: number
  onActiveChange?: (index: number) => void
  onItemSelect?: (item: CarouselItem, index: number) => void
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

const VISIBLE_COUNT = 5
const CARD_WIDTH = 212

function getItemPosition(index: number, activeIndex: number, total: number, trackWidth: number) {
  const offset = index - activeIndex
  const half = Math.floor(VISIBLE_COUNT / 2)
  let adjustedOffset = offset

  if (offset > half) adjustedOffset = offset - total
  if (offset < -half) adjustedOffset = offset + total
  if (Math.abs(adjustedOffset) > half) return null

  const cardWidth = trackWidth < 520 ? 188 : CARD_WIDTH
  const radiusX = Math.max(42, Math.min(224, (trackWidth - cardWidth) / 2 + 14))
  const radiusY = trackWidth < 520 ? 82 : 112
  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI
  const distance = Math.abs(adjustedOffset)

  return {
    x: Math.sin(angle) * radiusX,
    y: -Math.cos(angle) * radiusY + 24,
    scale: Math.max(0.74, 1 - (distance / (half + 1)) * 0.12),
    opacity: Math.max(0.28, 1 - (distance / (half + 1)) * 0.68),
    zIndex: VISIBLE_COUNT - distance,
  }
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  onItemSelect,
  autoPlay = true,
  autoPlayInterval = 4200,
  className = '',
}: CircularCarouselProps) {
  const reduceMotion = useReducedMotion()
  const [internalIndex, setInternalIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [trackWidth, setTrackWidth] = useState(680)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const total = items.length
  const activeIndex = total ? ((controlledIndex ?? internalIndex) + total) % total : 0
  const activeItem = items[activeIndex]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateWidth = () => setTrackWidth(track.getBoundingClientRect().width)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((index: number) => {
    if (!total) return
    const nextIndex = ((index % total) + total) % total
    if (controlledIndex === undefined) setInternalIndex(nextIndex)
    onActiveChange?.(nextIndex)
  }, [controlledIndex, onActiveChange, total])

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const previous = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (!autoPlay || reduceMotion || isPaused || total < 2) return
    const timer = window.setInterval(next, autoPlayInterval)
    return () => window.clearInterval(timer)
  }, [autoPlay, autoPlayInterval, isPaused, next, reduceMotion, total])

  const positions = useMemo(() => items.map((_, index) => ({
    index,
    position: getItemPosition(index, activeIndex, total, trackWidth),
  })), [activeIndex, items, total, trackWidth])

  if (!activeItem) return null

  return (
    <div
      className={`circular-carousel ${className}`.trim()}
      role="region"
      aria-label="可旋转的记忆搜索建议"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          previous()
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          next()
        }
      }}
    >
      <div className="circular-carousel-track" ref={trackRef}>
        <AnimatePresence initial={false}>
          {positions.map(({ index, position }) => {
            if (!position) return null
            const item = items[index]
            const isActive = index === activeIndex

            return (
              <motion.button
                key={item.id}
                type="button"
                className={`circular-carousel-card${isActive ? ' is-active' : ''}`}
                initial={{ opacity: 0, scale: 0.78 }}
                animate={position}
                exit={{ opacity: 0, scale: 0.78 }}
                transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  goTo(index)
                  onItemSelect?.(item, index)
                }}
                aria-label={`选择记忆：${item.title}`}
                aria-selected={isActive}
                role="option"
              >
                <span className="circular-carousel-card-topline">
                  <span className="circular-carousel-tag">{item.tag ?? 'memory'}</span>
                  <span className="circular-carousel-card-index">{String(index + 1).padStart(2, '0')}</span>
                </span>
                <span className="circular-carousel-card-copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <span className="circular-carousel-card-line" aria-hidden="true" />
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CircularCarousel
