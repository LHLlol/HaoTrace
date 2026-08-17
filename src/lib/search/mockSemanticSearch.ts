import type { Conversation, Message } from '../../types/conversation'
import type { ParsedQuery, SearchOptions, SearchProvider, SearchResult } from '../../types/search'
import type { ConversationRepository } from '../data/conversationRepository'
import { removeRoundToken } from './rounds'

const conceptDictionary: Record<string, string[]> = {
  睡眠: ['熬夜', '晚睡', '睡太晚', '早起', '凌晨', '睡觉', '睡眠'],
  海边: ['海边', '海', '沿海', '看海', '住在海边'],
  宠物: ['猫', '小猫', '养猫', '橘猫', '宠物', '猫砂盆'],
  工作压力: ['工作', '压力', '找工作', '面试', '上班', '结果', '焦虑'],
  安慰: ['安慰', '陪你', '不要怀疑', '没关系', '慢慢来', '一起想'],
  旅行: ['旅行', '旅游', '日本', '出门', '小镇', '烟花', '电车'],
  争执: ['吵架', '争执', '生气', '不想吃', '烦躁', '道歉', '晚饭'],
  电影: ['电影', '剧情', '看完', '结尾'],
  搬家: ['搬家', '房子', '房间', '阳台', '家'],
  毕业: ['毕业', '学校', '城市', '下一站'],
  异地: ['异地', '不同的城市', '隔着城市', '远距离'],
  未来计划: ['以后', '未来', '想去', '想住', '计划'],
  生日: ['生日', '蛋糕', '礼物'],
}

const conceptAliases: Record<string, string> = {
  小猫: '宠物',
  猫咪: '宠物',
  养宠物: '宠物',
  晚睡: '睡眠',
  熬夜: '睡眠',
  找工作: '工作压力',
  上班压力: '工作压力',
  压力大: '工作压力',
  安抚: '安慰',
  鼓励: '安慰',
  旅游: '旅行',
  出游: '旅行',
  吵架: '争执',
  拌嘴: '争执',
  闹矛盾: '争执',
  看电影: '电影',
  新家: '搬家',
  离开学校: '毕业',
  远距离恋爱: '异地',
}

function allTerms() {
  return [...new Set(Object.values(conceptDictionary).flat())].sort((a, b) => b.length - a.length)
}

function normalize(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
}

function normalizeForTokens(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, ' ')
    .trim()
}

const queryStopWords = new Set(['她', '我', '以前', '之前', '时候', '一次', '有一次', '说过', '提到', '找一下', '找找', '聊天', '记录', '关于', '当时', '好像', '记得', '是不是', '有没有', '什么', '大概', '附近', '左右', '一下', '那段', '那次', '相关', '内容'])

function extractChineseChunks(value: string) {
  const chunks = normalize(value).match(/[\u4e00-\u9fff]{2,}/g) ?? []
  const terms: string[] = []

  for (const chunk of chunks) {
    if (chunk.length <= 12 && !queryStopWords.has(chunk)) terms.push(chunk)

    for (const size of [2, 3, 4]) {
      if (chunk.length < size) continue
      for (let index = 0; index <= chunk.length - size; index += 1) {
        const piece = chunk.slice(index, index + size)
        if (!queryStopWords.has(piece)) terms.push(piece)
      }
    }
  }

  return terms
}

function extractWordTokens(value: string) {
  return normalizeForTokens(value)
    .split(/\s+/)
    .filter((piece) => piece.length > 1 && !queryStopWords.has(piece))
}

function removeContainedTerms(terms: string[]) {
  return [...new Set(terms)]
    .filter((term) => term.length > 1)
    .sort((a, b) => b.length - a.length)
    .filter((term, index, all) => !all.slice(0, index).some((longer) => longer.includes(term) && longer.length > term.length + 1))
}

function findDateParts(query: string) {
  const year = query.match(/20\d{2}/)?.[0]
  const month = query.match(/(?:年|\s)([1-9]|1[0-2])月/)?.[1]
  return { year: year ? Number(year) : undefined, month: month ? Number(month) : undefined }
}

export function parseQuery(input: string): ParsedQuery {
  const normalized = normalize(removeRoundToken(input))
  const terms = allTerms().filter((term) => normalized.includes(term.toLowerCase()))
  const concepts = [...new Set(terms.map((term) => conceptAliases[term] ?? Object.entries(conceptDictionary).find(([, values]) => values.includes(term))?.[0]).filter(Boolean))] as string[]
  const genericPieces = removeContainedTerms([
    ...extractWordTokens(input).filter((piece) => !/^20\d{2}$/.test(piece)),
    ...extractChineseChunks(input),
  ])
  const { year, month } = findDateParts(normalized)
  return {
    normalized,
    terms: [...new Set([...terms, ...genericPieces, ...(normalized.length > 1 ? [normalized] : [])])],
    tokens: genericPieces,
    concepts,
    year,
    month,
  }
}

function messageText(message: Message) {
  return normalize([
    message.content,
    message.sender,
    ...(message.tags ?? []),
    ...(message.topics ?? []),
    ...(message.emotion ?? []),
  ].join(' '))
}

function conceptsForText(text: string) {
  return Object.entries(conceptDictionary)
    .filter(([, aliases]) => aliases.some((alias) => text.includes(alias.toLowerCase())))
    .map(([concept]) => concept)
}

interface SearchIndex {
  conversations: Conversation[]
  messageTexts: Map<string, string>
  messageConcepts: Map<string, string[]>
  conversationMessageTexts: Map<string, string[]>
  conversationTexts: Map<string, string>
}

function buildSearchIndex(conversations: Conversation[], primarySpeaker: string): SearchIndex {
  const messageTexts = new Map<string, string>()
  const messageConcepts = new Map<string, string[]>()
  const conversationMessageTexts = new Map<string, string[]>()
  const conversationTexts = new Map<string, string>()

  for (const conversation of conversations) {
    const texts = conversation.messages.map((message) => {
      const text = messageText(message)
      messageTexts.set(message.id, text)
      messageConcepts.set(message.id, conceptsForText(text))
      return text
    })

    conversationMessageTexts.set(conversation.id, texts)
    conversationTexts.set(conversation.id, normalize([
      conversation.title ?? '',
      ...(conversation.topics ?? []),
      ...texts,
    ].join(' ')))
  }

  void primarySpeaker
  return { conversations, messageTexts, messageConcepts, conversationMessageTexts, conversationTexts }
}

function fuzzyTermScore(term: string, text: string) {
  if (term.length < 3 || text.includes(term)) return text.includes(term) ? 1 : 0

  const uniqueCharacters = [...new Set(term)]
  const characterCoverage = uniqueCharacters.filter((character) => text.includes(character)).length / uniqueCharacters.length
  if (characterCoverage < 0.75) return 0

  let cursor = 0
  let orderedMatches = 0
  for (const character of term) {
    const matchIndex = text.indexOf(character, cursor)
    if (matchIndex < 0) continue
    orderedMatches += 1
    cursor = matchIndex + 1
  }

  const sequenceCoverage = orderedMatches / term.length
  return sequenceCoverage >= 0.75 ? Math.min(0.78, sequenceCoverage * 0.86) : 0
}

function scoreMessage(message: Message, conversation: Conversation, query: ParsedQuery, options: SearchOptions, searchIndex: SearchIndex): SearchResult | null {
  const text = searchIndex.messageTexts.get(message.id) ?? ''
  const conversationText = searchIndex.conversationTexts.get(conversation.id) ?? ''
  const exactPhraseHit = query.normalized.length > 1 && text.includes(query.normalized)
  const termsHit = query.terms.filter((term) => (term.length > 1 || term === query.normalized) && text.includes(term.toLowerCase()))
  const fuzzyTerms = query.tokens
    .map((term) => ({ term, score: fuzzyTermScore(term, text) }))
    .filter(({ score }) => score > 0)
  const messageConcepts = searchIndex.messageConcepts.get(message.id) ?? []
  const matchedConcepts = query.concepts.filter((concept) => messageConcepts.includes(concept))
  const directTermHit = termsHit.length > 0 || fuzzyTerms.length > 0
  const semantic = query.concepts.length ? (matchedConcepts.length / query.concepts.length) * (directTermHit ? 1 : 0.72) : termsHit.length ? 0.42 : 0
  const keywordBase = query.tokens.length ? fuzzyTerms.reduce((total, match) => total + match.score, 0) / query.tokens.length : 0
  const keyword = Math.min(1, Math.max(keywordBase, exactPhraseHit ? 1 : 0))
  const messageIndex = conversation.messages.findIndex((candidate) => candidate.id === message.id)
  const messageTexts = searchIndex.conversationMessageTexts.get(conversation.id) ?? []
  const contextText = messageTexts.slice(Math.max(0, messageIndex - 2), Math.min(messageTexts.length, messageIndex + 3)).join(' ')
  const contextHits = query.terms.filter((term) => contextText.includes(term.toLowerCase()))
  const context = query.terms.length ? Math.min(1, contextHits.length / Math.min(query.terms.length + 1, 5)) : 0
  const conversationPhraseHit = query.normalized.length > 1 && conversationText.includes(query.normalized) && contextText.includes(query.normalized)
  const yearMatches = query.year ? message.year === query.year : true
  const monthMatches = query.month ? message.month === query.month : true
  const time = query.year || query.month ? (yearMatches && monthMatches ? 1 : yearMatches || monthMatches ? 0.38 : 0) : 0.22
  if ((options.year && message.year !== options.year) || (options.month && message.month !== options.month)) return null
  if (options.startDate && message.date < options.startDate) return null
  if (options.endDate && message.date > options.endDate) return null
  const phrase = exactPhraseHit ? 1 : conversationPhraseHit ? 0.56 : 0
  const final = phrase * 0.58 + semantic * 0.2 + keyword * 0.22 + context * 0.06 + time * 0.03
  const contextSize = options.contextSize ?? 3
  if (!query.normalized && (options.startDate || options.endDate)) {
    return {
      message,
      conversation,
      context: conversation.messages.slice(Math.max(0, messageIndex - contextSize), Math.min(conversation.messages.length, messageIndex + contextSize + 1)),
      scores: { semantic: 0, keyword: 0, context: 0, time: 1, final: 1 },
      matchedConcepts: [],
    }
  }
  if (final < (exactPhraseHit ? 0.1 : 0.14)) return null
  return {
    message,
    conversation,
    context: conversation.messages.slice(Math.max(0, messageIndex - contextSize), Math.min(conversation.messages.length, messageIndex + contextSize + 1)),
    scores: { semantic, keyword, context, time, final },
    matchedConcepts,
  }
}

export class MockSemanticSearch implements SearchProvider {
  private indexPromise: Promise<SearchIndex> | undefined

  constructor(
    private readonly repository: ConversationRepository,
    private readonly primarySpeaker = '王木木',
  ) {}

  async search(input: string, options: SearchOptions = {}) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 160))
    const query = parseQuery(input)
    this.indexPromise ??= this.repository.listConversations().then((conversations) => buildSearchIndex(conversations, this.primarySpeaker))
    const index = await this.indexPromise
    const conversations = index.conversations
    const rankedResults = conversations.flatMap((conversation) => conversation.messages
      .map((message) => scoreMessage(message, conversation, query, options, index))
      .filter((result): result is SearchResult => Boolean(result)))
      .sort((a, b) => b.scores.final - a.scores.final)
    const uniqueConversations: SearchResult[] = []
    const seenConversations = new Set<string>()
    for (const result of rankedResults) {
      if (seenConversations.has(result.conversation.id)) continue
      seenConversations.add(result.conversation.id)
      uniqueConversations.push(result)
    }
    return uniqueConversations.slice(0, options.limit ?? 8)
  }
}
