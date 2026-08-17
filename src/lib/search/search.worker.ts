import { localConversationRepository } from '../data/localConversationRepository'
import type { SearchOptions, SearchResult } from '../../types/search'
import { MockSemanticSearch } from './mockSemanticSearch'

interface SearchRequest {
  id: number
  query: string
  options: SearchOptions
}

interface SearchResponse {
  id: number
  results?: SearchResult[]
  error?: string
}

const searchProvider = new MockSemanticSearch(localConversationRepository, '王木木')
const workerScope = globalThis as typeof globalThis & {
  onmessage: ((event: MessageEvent<SearchRequest>) => void) | null
  postMessage: (message: SearchResponse) => void
}

workerScope.onmessage = async (event) => {
  const { id, query, options } = event.data
  try {
    const results = await searchProvider.search(query, options)
    workerScope.postMessage({ id, results })
  } catch (error) {
    workerScope.postMessage({ id, error: error instanceof Error ? error.message : 'Unable to search memories' })
  }
}
