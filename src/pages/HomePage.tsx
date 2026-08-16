import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionBox from '../components/QuestionBox'
import InteractiveDots from '../components/ui/interactive-dots'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomePage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState('')

  const search = () => {
    const normalizedQuery = query.trim()
    if (normalizedQuery) navigate(`/search?q=${encodeURIComponent(normalizedQuery)}`)
  }

  return (
    <div className="dots-home">
      <a className="skip-link" href="#memory-search">Skip to memory search</a>
      <InteractiveDots spacing={34} dotRadius={6} repelForce={1} repelDistance={18000} returnSpeed={1.1} />

      <div className="minimal-stage">
        <motion.h1
          className="minimal-title"
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease }}
        >
          <span className="minimal-title-cn">浩迹</span>
          <span className="minimal-title-en">HaoTrace</span>
        </motion.h1>

        <motion.div
          className="question-box-wrap"
          initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.12, ease }}
        >
          <QuestionBox value={query} onChange={setQuery} onSubmit={search} />
        </motion.div>
      </div>
    </div>
  )
}
