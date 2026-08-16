import fs from 'node:fs/promises'
import path from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3] ?? path.resolve('public/data/haotrace-conversations.json')
const primarySpeaker = '王木木'
const segmentGapMs = 6 * 60 * 60 * 1000
const headerPattern = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) '([^']+)'$/
const coverTones = ['blue', 'coral', 'mint', 'yellow', 'pink']

if (!inputPath) {
  throw new Error('Usage: npm run import:chat -- "/absolute/path/to/chat.txt" [output-path]')
}

function parseMessages(source) {
  const messages = []
  let current

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

  return messages.map((message, index) => {
    const [date, time] = message.timestamp.split(' ')
    const [year, month, day] = date.split('-').map(Number)

    return {
      id: `msg-${String(index + 1).padStart(6, '0')}`,
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

function segmentMessages(messages) {
  const segments = []
  let current = []

  for (const message of messages) {
    const previous = current.at(-1)
    const gap = previous
      ? new Date(message.timestamp).getTime() - new Date(previous.timestamp).getTime()
      : 0

    if (current.length && gap >= segmentGapMs) {
      segments.push(current)
      current = []
    }

    current.push(message)
  }

  if (current.length) segments.push(current)
  return segments
}

function createConversations(messages) {
  return segmentMessages(messages).map((segment, index) => {
    const id = `thread-${String(index + 1).padStart(4, '0')}-${segment[0].date}`

    return {
      id,
      title: `私聊片段 · ${segment[0].date}`,
      participants: [...new Set(segment.map((message) => message.sender))],
      messages: segment.map((message) => ({ ...message, conversationId: id })),
      startTime: segment[0].timestamp,
      endTime: segment.at(-1).timestamp,
      coverTone: coverTones[index % coverTones.length],
    }
  })
}

const source = await fs.readFile(inputPath, 'utf8')
const messages = parseMessages(source)
const conversations = createConversations(messages)
const payload = {
  version: 1,
  primarySpeaker,
  importedMessageCount: messages.length,
  importedAtRange: {
    start: messages[0]?.timestamp,
    end: messages.at(-1)?.timestamp,
  },
  conversations,
}

await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, JSON.stringify(payload))

const speakerCounts = messages.reduce((counts, message) => {
  counts[message.sender] = (counts[message.sender] ?? 0) + 1
  return counts
}, {})

console.log(JSON.stringify({
  outputPath,
  messageCount: messages.length,
  conversationCount: conversations.length,
  speakerCounts,
  dateRange: [messages[0]?.date, messages.at(-1)?.date],
}, null, 2))
