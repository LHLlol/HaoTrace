import { localConversationRepository } from '../data/localConversationRepository'
import { MockSemanticSearch } from './mockSemanticSearch'
import type { SearchOptions, SearchProvider, SearchResult } from '../../types/search'

interface SearchWorkerRequest {
  id: number
  query: string
  options: SearchOptions
}

interface PendingSearch extends SearchWorkerRequest {
  resolve: (results: SearchResult[]) => void
  reject: (error: Error) => void
}

interface SearchWorkerResponse {
  id: number
  results?: SearchResult[]
  error?: string
}

class WorkerSearchProvider implements SearchProvider {
  private readonly fallback: SearchProvider
  private worker: Worker | undefined
  private requestId = 0
  private readonly pending = new Map<number, PendingSearch>()

  constructor(fallback: SearchProvider) {
    this.fallback = fallback
    if (typeof Worker === 'undefined') return

    this.worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
      const request = this.pending.get(event.data.id)
      if (!request) return
      this.pending.delete(event.data.id)
      if (event.data.error) {
        request.reject(new Error(event.data.error))
        return
      }
      request.resolve(event.data.results ?? [])
    }
    this.worker.onerror = () => {
      const failedRequests = [...this.pending.values()]
      this.pending.clear()
      this.worker?.terminate()
      this.worker = undefined
      failedRequests.forEach((request) => {
        this.fallback.search(request.query, request.options).then(request.resolve, request.reject)
      })
    }
  }

  search(query: string, options: SearchOptions = {}) {
    if (!this.worker) return this.fallback.search(query, options)

    const id = ++this.requestId
    return new Promise<SearchResult[]>((resolve, reject) => {
      const request = { id, query, options, resolve, reject }
      this.pending.set(id, request)
      try {
        this.worker?.postMessage({ id, query, options })
      } catch {
        this.pending.delete(id)
        this.fallback.search(query, options).then(resolve, reject)
      }
    })
  }
}

export const searchProvider = new WorkerSearchProvider(new MockSemanticSearch(localConversationRepository, '王木木'))
