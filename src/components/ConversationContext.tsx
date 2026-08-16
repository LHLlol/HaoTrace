import { ArrowDown, ArrowUp, CalendarDays, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Conversation, Message } from '../types/conversation'

function dateTitle(message: Message) {
  const date = new Date(`${message.date}T${message.timestamp.slice(11, 16)}:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

export default function ConversationContext({ conversation, focusMessageId }: { conversation: Conversation; focusMessageId?: string }) {
  const focusIndex = Math.max(0, conversation.messages.findIndex((message) => message.id === focusMessageId))
  const [visibleStart, visibleEnd] = [Math.max(0, focusIndex - 3), Math.min(conversation.messages.length, focusIndex + 4)]
  const visibleMessages = conversation.messages.slice(visibleStart, visibleEnd)
  const focus = conversation.messages[focusIndex]

  return (
    <div className="conversation-context">
      <div className="conversation-date-card">
        <CalendarDays size={17} strokeWidth={1.5} />
        <div><span>{dateTitle(focus)}</span><strong>{focus.timestamp.slice(11, 16)} · {conversation.title}</strong></div>
      </div>
      <div className="conversation-thread">
        <div className="thread-line" />
        {visibleStart > 0 && (
          <button className="thread-more earlier"><ArrowUp size={14} /> Show earlier messages</button>
        )}
        {visibleMessages.map((message, index) => {
          const isFocus = message.id === focusMessageId
          return (
            <motion.div key={message.id} className={`thread-message ${message.sender === '我' ? 'mine' : ''} ${isFocus ? 'focused' : ''}`} initial={{ opacity: 0, x: message.sender === '我' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.045 }}>
              <div className="thread-time">{message.timestamp.slice(11, 16)}</div>
              <div className="thread-node"><span /></div>
              <div className="thread-bubble-wrap">
                <div className="thread-sender">{message.sender}<span>{isFocus ? 'the memory you were looking for' : ' '}</span></div>
                <div className="thread-bubble">{message.content}{isFocus && <MessageCircle className="focus-bubble-icon" size={15} strokeWidth={1.7} />}</div>
              </div>
            </motion.div>
          )
        })}
        {visibleEnd < conversation.messages.length && (
          <button className="thread-more later"><ArrowDown size={14} /> Show later messages</button>
        )}
      </div>
      <div className="context-footnote"><ChevronLeft size={14} /> This little fragment is part of a longer conversation <ChevronRight size={14} /></div>
    </div>
  )
}
