import type { Conversation, Message } from './conversation'

export interface SearchOptions {
  year?: number
  month?: number
  startDate?: string
  endDate?: string
  contextSize?: number
  limit?: number
}

export interface SearchScores {
  semantic: number
  keyword: number
  context: number
  time: number
  final: number
}

export interface SearchResult {
  message: Message
  conversation: Conversation
  context: Message[]
  scores: SearchScores
  matchedConcepts: string[]
}

export interface SearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>
  importConversations?(conversations: Conversation[]): Promise<void>
}

export interface ParsedQuery {
  normalized: string
  terms: string[]
  tokens: string[]
  concepts: string[]
  year?: number
  month?: number
}
