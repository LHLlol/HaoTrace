import type { Conversation, Message } from '../../types/conversation'

const headerPattern = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) '([^']+)'$/
const segmentGapMs = 6 * 60 * 60 * 1000
const coverTones: Conversation['coverTone'][] = ['blue', 'coral', 'mint', 'yellow', 'pink']

export interface ImportedChatPayload {
  version: number
  primarySpeaker: string
  importedMessageCount: number
  importedAtRange: { start?: string; end?: string }
  conversations: Conversation[]
}

type ImportedMessage = Omit<Message, 'conversationId'>

function parseMessages(source: string) {
  const messages: Array<{ timestamp: string; sender: string; contentLines: string[] }> = []
  let current: { timestamp: string; sender: string; contentLines: string[] } | undefined

  for (const line of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const header = line.match(headerPattern)
    if (header) {
      if (current) messages.push(current)
      current = { timestamp: header[1], sender: header[2], contentLines: [] }
      continue
    }
    if (current && line.trim()) current.contentLines.push(line)
  }
  if (current) messages.push(current)

  return messages.map((message, index): ImportedMessage => {
    const [date, time] = message.timestamp.split(' ')
    const [year, month, day] = date.split('-').map(Number)
    return {
      id: `imported-msg-${String(index + 1).padStart(6, '0')}`,
      sender: message.sender,
      content: message.contentLines.join('\n'),
      timestamp: `${date}T${time}`,
      date,
      year,
      month,
      day,
    }
  })
}

function segmentMessages(messages: ImportedMessage[]) {
  const segments: ImportedMessage[][] = []
  let current: ImportedMessage[] = []

  for (const message of messages) {
    const previous = current[current.length - 1]
    const gap = previous ? new Date(message.timestamp).getTime() - new Date(previous.timestamp).getTime() : 0
    if (current.length && gap >= segmentGapMs) {
      segments.push(current)
      current = []
    }
    current.push(message)
  }
  if (current.length) segments.push(current)
  return segments
}

export function parseChatText(source: string): ImportedChatPayload {
  const messages = parseMessages(source)
  if (!messages.length) throw new Error('没有识别到符合格式的聊天记录')

  const conversations = segmentMessages(messages).map((segment, index) => {
    const id = `imported-thread-${String(index + 1).padStart(4, '0')}-${segment[0].date}`
    return {
      id,
      title: `导入片段 · ${segment[0].date}`,
      participants: [...new Set(segment.map((message) => message.sender))],
      messages: segment.map((message) => ({ ...message, conversationId: id })),
      startTime: segment[0].timestamp,
      endTime: segment[segment.length - 1]?.timestamp ?? segment[0].timestamp,
      coverTone: coverTones[index % coverTones.length],
    }
  })

  return {
    version: 1,
    primarySpeaker: '王木木',
    importedMessageCount: messages.length,
    importedAtRange: {
      start: messages[0]?.timestamp,
      end: messages[messages.length - 1]?.timestamp,
    },
    conversations,
  }
}
