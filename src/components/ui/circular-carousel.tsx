import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'

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

const ACCENT_COLORS = [
  { solid: '#ff6a63', rgb: '255, 106, 99' },
  { solid: '#ffe36e', rgb: '255, 227, 110' },
  { solid: '#66e3ff', rgb: '102, 227, 255' },
  { solid: '#76f6c7', rgb: '118, 246, 199' },
  { solid: '#ff9d66', rgb: '255, 157, 102' },
  { solid: '#ff78c8', rgb: '255, 120, 200' },
  { solid: '#b9ff60', rgb: '185, 255, 96' },
  { solid: '#a6a0ff', rgb: '166, 160, 255' },
] as const

function getAccentIndex(id: string, index: number) {
  let hash = index + 17
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash % ACCENT_COLORS.length
}

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
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerDraggedRef = useRef(false)
  const suppressClickUntilRef = useRef(0)

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

  const accents = useMemo(() => items.map((item, index) => ACCENT_COLORS[getAccentIndex(item.id, index)]), [items])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    pointerDraggedRef.current = false
    setIsPaused(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    const start = pointerStartRef.current
    if (!start) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (!pointerDraggedRef.current && Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      pointerStartRef.current = null
      return
    }

    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      pointerDraggedRef.current = true
      event.preventDefault()
    }
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    const start = pointerStartRef.current
    if (!start) return

    const deltaX = event.clientX - start.x
    if (pointerDraggedRef.current && Math.abs(deltaX) >= 52) {
      // Keep the release click from selecting whichever card is under the pointer.
      // Some touch browsers dispatch that click a tick after pointerup.
      suppressClickUntilRef.current = Date.now() + 450
      if (deltaX < 0) next()
      else previous()
    }

    pointerStartRef.current = null
    pointerDraggedRef.current = false
    setIsPaused(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  // Keep a mouse fallback for browsers that expose desktop drags as mouse events
  // instead of pointer events (the same threshold is used for touch swipes).
  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    pointerDraggedRef.current = false
    setIsPaused(true)
  }

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start) return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (!pointerDraggedRef.current && Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      pointerStartRef.current = null
      return
    }
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      pointerDraggedRef.current = true
      event.preventDefault()
    }
  }

  const handleMouseUp = (event: ReactMouseEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start) return
    const deltaX = event.clientX - start.x
    if (pointerDraggedRef.current && Math.abs(deltaX) >= 52) {
      suppressClickUntilRef.current = Date.now() + 450
      if (deltaX < 0) next()
      else previous()
    }
    pointerStartRef.current = null
    pointerDraggedRef.current = false
  }

  if (!activeItem) return null

  return (
    <div
      className={`circular-carousel ${className}`.trim()}
      role="region"
      aria-label="可旋转的记忆搜索建议，可左右滑动切换"
      aria-roledescription="carousel"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
            const accent = accents[index]
            const isActive = index === activeIndex

            return (
              <motion.button
                key={item.id}
                type="button"
                className={`circular-carousel-card${isActive ? ' is-active' : ''}`}
                style={{ '--carousel-accent': accent.solid, '--carousel-accent-rgb': accent.rgb } as CSSProperties}
                initial={{ opacity: 0, scale: 0.78 }}
                animate={position}
                exit={{ opacity: 0, scale: 0.78 }}
                transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => {
                  if (Date.now() < suppressClickUntilRef.current) {
                    event.preventDefault()
                    return
                  }
                  if (!isActive) {
                    goTo(index)
                    return
                  }
                  onItemSelect?.(item, index)
                }}
                aria-label={isActive ? `确认选择记忆：${item.title}` : `将记忆移到最前面：${item.title}`}
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
