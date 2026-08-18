import type React from 'react'
import { useEffect, useRef } from 'react'

interface InteractiveDotsProps {
  colors?: string[]
  spacing?: number
  dotRadius?: number
  repelForce?: number
  repelDistance?: number
  returnSpeed?: number
  paused?: boolean
  className?: string
  style?: React.CSSProperties
}

interface Dot {
  x: number
  y: number
  originX: number
  originY: number
  color: string
  radius: number
}

const DEFAULT_COLORS = [
  '#C501E1',
  '#9A26F8',
  '#6564FE',
  '#2B97FA',
  '#02C4E7',
  '#16E6CC',
  '#2EF9A0',
  '#C6E501',
  '#E7C501',
  '#FF6A63',
  '#F82D98',
  '#E830CE',
]

export function InteractiveDots({
  colors = DEFAULT_COLORS,
  spacing = 40,
  dotRadius = 12,
  repelForce = 0.6,
  repelDistance = 10000,
  returnSpeed = 1,
  paused = false,
  className = '',
  style = {},
}: InteractiveDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const updateRef = useRef<(() => void) | undefined>(undefined)
  const pausedRef = useRef(paused)
  const reducedMotionRef = useRef(false)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -99999, y: -99999 })

  useEffect(() => {
    pausedRef.current = paused
    if (paused) {
      mouseRef.current = { x: -99999, y: -99999 }
      if (animationRef.current !== undefined) window.cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
      return
    }

    if (!reducedMotionRef.current && animationRef.current === undefined && updateRef.current) {
      animationRef.current = window.requestAnimationFrame(updateRef.current)
    }
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = reducedMotion
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    const drawDot = (dot: Dot, ctx: CanvasRenderingContext2D) => {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
      ctx.fillStyle = dot.color
      ctx.fill()
    }

    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const columns = Math.max(1, Math.floor(width / spacing))
      const rows = Math.max(1, Math.floor(height / spacing))
      const xOffset = (width - (columns - 1) * spacing) / 2
      const yOffset = (height - (rows - 1) * spacing) / 2
      const dots: Dot[] = []
      for (let column = 0; column < columns; column += 1) {
        const x = xOffset + column * spacing
        for (let row = 0; row < rows; row += 1) {
          const y = yOffset + row * spacing
          dots.push({
            x,
            y,
            originX: x,
            originY: y,
            color: colors[Math.floor(Math.random() * colors.length)] ?? DEFAULT_COLORS[0],
            radius: dotRadius,
          })
        }
      }
      dotsRef.current = dots

      context.clearRect(0, 0, width, height)
      dots.forEach((dot) => drawDot(dot, context))
    }

    const update = () => {
      animationRef.current = undefined
      const width = window.innerWidth
      const height = window.innerHeight
      context.clearRect(0, 0, width, height)

      dotsRef.current.forEach((dot) => {
        const distanceX = dot.x - mouseRef.current.x
        const distanceY = dot.y - mouseRef.current.y
        const distanceSquared = distanceX * distanceX + distanceY * distanceY

        if (distanceSquared < repelDistance && distanceSquared > 0) {
          const distance = Math.sqrt(distanceSquared)
          const strength = ((repelDistance - distanceSquared) / repelDistance) * repelForce
          dot.x += (distanceX / distance) * strength * 16
          dot.y += (distanceY / distance) * strength * 16
        } else {
          dot.x += (dot.originX - dot.x) * 0.02 * returnSpeed
          dot.y += (dot.originY - dot.y) * 0.02 * returnSpeed
        }

        if (dot.x < -spacing || dot.x > width + spacing) dot.x = dot.originX
        if (dot.y < -spacing || dot.y > height + spacing) dot.y = dot.originY

        drawDot(dot, context)
      })

      if (!reducedMotion && !pausedRef.current) {
        animationRef.current = window.requestAnimationFrame(update)
      }
    }
    updateRef.current = update

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent) {
        mouseRef.current = { x: event.clientX, y: event.clientY }
      } else if (event.touches.length > 0) {
        mouseRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
      if (idlePointerTimer !== undefined) window.clearTimeout(idlePointerTimer)
      idlePointerTimer = window.setTimeout(resetPointer, 240)
    }
    const resetPointer = () => {
      if (idlePointerTimer !== undefined) {
        window.clearTimeout(idlePointerTimer)
        idlePointerTimer = undefined
      }
      mouseRef.current = { x: -99999, y: -99999 }
    }
    let idlePointerTimer: number | undefined

    resizeCanvas()
    if (!pausedRef.current) update()

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: true })
    window.addEventListener('mouseleave', resetPointer)
    window.addEventListener('blur', resetPointer)
    window.addEventListener('touchend', resetPointer, { passive: true })
    window.addEventListener('touchcancel', resetPointer, { passive: true })

    return () => {
      if (animationRef.current !== undefined) window.cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
      if (idlePointerTimer !== undefined) window.clearTimeout(idlePointerTimer)
      if (updateRef.current === update) updateRef.current = undefined
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseleave', resetPointer)
      window.removeEventListener('blur', resetPointer)
      window.removeEventListener('touchend', resetPointer)
      window.removeEventListener('touchcancel', resetPointer)
    }
  }, [colors, dotRadius, repelDistance, repelForce, returnSpeed, spacing])

  return (
    <canvas
      ref={canvasRef}
      className={`interactive-dots-canvas ${className}`.trim()}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export default InteractiveDots
