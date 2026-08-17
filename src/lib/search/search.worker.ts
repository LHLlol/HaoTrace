import { localConversationRepository } from '../data/localConversationRepository'
import type { Conversation } from '../../types/conversation'
import type { SearchOptions, SearchResult } from '../../types/search'
import { MockSemanticSearch } from './mockSemanticSearch'

interface SearchRequest {
  type: 'search'
  id: number
  query: string
  options: SearchOptions
}

interface ImportRequest {
  type: 'import'
  id: number
  conversations: Conversation[]
}

interface SearchResponse {
  type: 'search' | 'import'
  id: number
  results?: SearchResult[]
  error?: string
}

const searchProvider = new MockSemanticSearch(localConversationRepository, '王木木')
const workerScope = globalThis as typeof globalThis & {
  onmessage: ((event: MessageEvent<SearchRequest>) => void) | null
  postMessage: (message: SearchResponse) => void
}

workerScope.onmessage = async (event: MessageEvent<SearchRequest | ImportRequest>) => {
  const { id } = event.data
  try {
    if (event.data.type === 'import') {
      await searchProvider.importConversations(event.data.conversations)
      workerScope.postMessage({ type: 'import', id })
      return
    }
    const results = await searchProvider.search(event.data.query, event.data.options)
    workerScope.postMessage({ type: 'search', id, results })
  } catch (error) {
    workerScope.postMessage({ type: event.data.type, id, error: error instanceof Error ? error.message : 'Unable to process memory data' })
  }
}
