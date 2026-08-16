import { ArrowUpRight, CalendarDays, ChevronRight, Clock3, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MemoryLandscape from '../components/MemoryLandscape'
import { localConversationRepository } from '../lib/data/localConversationRepository'
import type { Conversation } from '../types/conversation'

const toneLabels: Record<string, string> = { coral: 'a little intense', blue: 'one to keep', mint: 'soft around the edges', yellow: 'warmly remembered', pink: 'still glowing' }

export default function TimelinePage() {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    localConversationRepository.listConversations().then(setConversations)
  }, [])

  const grouped = conversations.reduce<Record<string, typeof conversations>>((acc, conversation) => {
    const year = conversation.startTime.slice(0, 4)
    acc[year] ??= []
    acc[year].push(conversation)
    return acc
  }, {})

  if (!conversations.length) return <div className="loading-page"><span className="loader-ring" />Opening the timeline…</div>

  return (
    <div className="timeline-page page-content">
      <section className="timeline-head">
        <div>
          <p className="eyebrow"><CalendarDays size={14} /> A slower way in</p>
          <h1>沿着时间，<br /><i>走回去。</i></h1>
          <p>如果你还没想好怎么描述，就从某一年开始。每个小点，都是一段可以重新打开的对话。</p>
        </div>
        <MemoryLandscape compact />
      </section>
      <section className="timeline-body">
        <div className="timeline-marker"><span>your<br /><i>story</i></span><span className="timeline-vertical-line" /></div>
        <div className="timeline-years">
          {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearConversations]) => (
            <motion.section key={year} className="year-section" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
              <div className="year-title"><strong>{year}</strong><span>{yearConversations.length} fragments</span></div>
              <div className="year-fragments">
                {yearConversations.sort((a, b) => b.startTime.localeCompare(a.startTime)).map((conversation) => {
                  const message = conversation.messages[Math.floor(conversation.messages.length / 2)]
                  return (
                    <Link className={`timeline-fragment tone-${conversation.coverTone}`} to={`/conversation/${conversation.id}?message=${message.id}`} key={conversation.id}>
                      <div className="fragment-date"><strong>{message.date.slice(5).replace('-', '.')}</strong><span>{message.timestamp.slice(11, 16)}</span></div>
                      <div className="fragment-copy"><span className="fragment-kicker"><Sparkles size={11} /> {toneLabels[conversation.coverTone ?? 'coral']}</span><h2>{conversation.title}</h2><p>{message.content}</p><div className="fragment-bottom"><span><Clock3 size={12} /> {conversation.messages.length} messages</span><span><MapPin size={12} /> {conversation.topics?.slice(0, 2).join(' · ')}</span></div></div>
                      <ArrowUpRight className="fragment-arrow" size={19} strokeWidth={1.5} />
                    </Link>
                  )
                })}
              </div>
              <div className="year-arrow"><ChevronRight size={16} /><span>keep wandering</span></div>
            </motion.section>
          ))}
        </div>
      </section>
    </div>
  )
}
