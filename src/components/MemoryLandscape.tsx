import { motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, Coffee, Mail, Moon, PawPrint, Plane, Star, Utensils, Volume2 } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

const doodles = [
  { icon: Mail, className: 'doodle-mail', tone: 'blue', label: 'a note' },
  { icon: Coffee, className: 'doodle-coffee', tone: 'yellow', label: 'a coffee' },
  { icon: PawPrint, className: 'doodle-paw', tone: 'coral', label: 'a cat' },
  { icon: CalendarDays, className: 'doodle-calendar', tone: 'mint', label: 'a date' },
  { icon: Plane, className: 'doodle-plane', tone: 'pink', label: 'a trip' },
  { icon: Moon, className: 'doodle-moon', tone: 'blue', label: 'a night' },
  { icon: Utensils, className: 'doodle-utensils', tone: 'yellow', label: 'a meal' },
  { icon: Volume2, className: 'doodle-sound', tone: 'coral', label: 'a voice note' },
]

export default function MemoryLandscape({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion()
  return (
    <div className={`memory-landscape ${compact ? 'compact' : ''}`} aria-hidden="true">
      <img className="generated-landscape-art" src={`${import.meta.env.BASE_URL}assets/memory-landscape.png`} alt="" />
      <svg className="landscape-route" viewBox="0 0 1200 250" preserveAspectRatio="none">
        <path d="M-30 157 C 100 62, 180 226, 300 135 S 475 58, 585 143 S 770 215, 875 119 S 1060 37, 1230 116" />
        <path className="landscape-route-offset" d="M-30 164 C 100 69, 180 233, 300 142 S 475 65, 585 150 S 770 222, 875 126 S 1060 44, 1230 123" />
      </svg>
      <div className="landscape-note landscape-note-left">somewhere between<br /><i>then</i> and now</div>
      <div className="landscape-note landscape-note-right">your memories<br /><i>are still here</i></div>
      {doodles.map(({ icon: Icon, className, tone, label }, index) => (
        <motion.div
          key={className}
          className={`landscape-doodle ${className} doodle-${tone}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, rotate: index % 2 ? 3 : -3 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -4, 0], rotate: index % 2 ? [3, 1, 3] : [-3, -5, -3] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { duration: 0.7, delay: index * 0.06 }, y: { duration: 5 + index * 0.22, repeat: Infinity, ease: 'easeInOut', delay: 0.5 + index * 0.1 }, rotate: { duration: 5 + index * 0.22, repeat: Infinity, ease: 'easeInOut', delay: 0.5 + index * 0.1 } }}
          title={label}
        >
          <Icon size={compact ? 18 : 22} strokeWidth={1.5} />
          {index === 2 && <Star className="doodle-star" size={10} strokeWidth={1.5} />}
        </motion.div>
      ))}
      <div className="route-node route-node-a"><span>01</span></div>
      <div className="route-node route-node-b"><span>02</span></div>
      <div className="route-node route-node-c"><span>03</span></div>
    </div>
  )
}
