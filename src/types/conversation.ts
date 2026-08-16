export type Participant = '我' | '她' | '他' | '朋友' | string

export interface Message {
  id: string
  conversationId: string
  sender: Participant
  content: string
  timestamp: string
  date: string
  year: number
  month: number
  day: number
  replyTo?: string
  contextBefore?: string[]
  contextAfter?: string[]
  tags?: string[]
  emotion?: string[]
  topics?: string[]
}

export interface Conversation {
  id: string
  title?: string
  participants: Participant[]
  messages: Message[]
  startTime: string
  endTime: string
  coverTone?: 'coral' | 'blue' | 'mint' | 'yellow' | 'pink'
  topics?: string[]
}
