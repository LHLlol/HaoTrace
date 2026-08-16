import { ArrowLeft, CalendarDays, LockKeyhole, Tags } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ConversationContext from '../components/ConversationContext'
import MemoryLandscape from '../components/MemoryLandscape'
import { localConversationRepository } from '../lib/data/localConversationRepository'
import type { Conversation } from '../types/conversation'

export default function ConversationPage() {
  const { conversationId } = useParams()
  const location = useLocation()
  const focusMessageId = new URLSearchParams(location.search).get('message') ?? undefined
  const [conversation, setConversation] = useState<Conversation>()

  useEffect(() => { if (conversationId) localConversationRepository.getConversation(conversationId).then(setConversation) }, [conversationId])

  if (!conversation) return <div className="loading-page"><span className="loader-ring" />Opening this memory…</div>

  const first = conversation.messages[0]
  const last = conversation.messages[conversation.messages.length - 1]
  return (
    <div className="conversation-page page-content">
      <section className="conversation-head">
        <Link to="/search" className="back-link"><ArrowLeft size={15} /> Back to results</Link>
        <div className="conversation-heading">
          <div>
            <p className="eyebrow"><CalendarDays size={14} /> {first.date.split('-').join(' / ')}</p>
            <h1>{conversation.title}</h1>
            <p className="conversation-subtitle">{conversation.participants.join(' / ')} <span>·</span> {first.timestamp.slice(11, 16)} to {last.timestamp.slice(11, 16)}</p>
          </div>
          <div className="conversation-status"><LockKeyhole size={14} /> Private fragment</div>
        </div>
        <MemoryLandscape compact />
      </section>
      <section className="conversation-body">
        <aside className="conversation-sidebar">
          <div className="side-stamp">FRAGMENT<br /><strong>/{conversation.id}</strong></div>
          <div className="side-summary"><span>People</span><strong>{conversation.participants.join(' + ')}</strong></div>
          <div className="side-summary"><span>Messages</span><strong>{conversation.messages.length} in this fragment</strong></div>
          <div className="side-summary"><span>Topics</span><div className="side-tags">{conversation.topics?.map((topic) => <span key={topic}><Tags size={11} /> {topic}</span>)}</div></div>
          <p className="side-note">Every memory keeps a little of what came before and after. That’s usually where the feeling lives.</p>
        </aside>
        <motion.div className="conversation-main" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <ConversationContext conversation={conversation} focusMessageId={focusMessageId ?? conversation.messages[Math.floor(conversation.messages.length / 2)].id} />
        </motion.div>
      </section>
    </div>
  )
}
