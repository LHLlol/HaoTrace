import { localConversationRepository } from '../data/localConversationRepository'
import { MockSemanticSearch } from './mockSemanticSearch'
import type { Conversation } from '../../types/conversation'
import type { SearchOptions, SearchProvider, SearchResult } from '../../types/search'

interface SearchWorkerRequest {
  type: 'search'
  id: number
  query: string
  options: SearchOptions
}

interface ImportWorkerRequest {
  type: 'import'
  id: number
  conversations: Conversation[]
}

interface PendingSearch extends SearchWorkerRequest {
  kind: 'search'
  resolve: (results: SearchResult[]) => void
  reject: (error: Error) => void
}

interface PendingImport extends ImportWorkerRequest {
  kind: 'import'
  resolve: () => void
  reject: (error: Error) => void
}

interface SearchWorkerResponse {
  type: 'search' | 'import'
  id: number
  results?: SearchResult[]
  error?: string
}

class WorkerSearchProvider implements SearchProvider {
  private readonly fallback: SearchProvider
  private worker: Worker | undefined
  private requestId = 0
  private readonly pending = new Map<number, PendingSearch | PendingImport>()

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
      if (request.kind === 'import') {
        request.resolve()
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
        if (request.kind === 'import') {
          const importer = this.fallback.importConversations
          if (importer) importer.call(this.fallback, request.conversations).then(request.resolve, request.reject)
          else request.resolve()
        } else {
          this.fallback.search(request.query, request.options).then(request.resolve, request.reject)
        }
      })
    }
  }

  search(query: string, options: SearchOptions = {}) {
    if (!this.worker) return this.fallback.search(query, options)

    const id = ++this.requestId
    return new Promise<SearchResult[]>((resolve, reject) => {
      const request = { id, query, options, resolve, reject }
      this.pending.set(id, { ...request, type: 'search', kind: 'search' })
      try {
        this.worker?.postMessage({ type: 'search', id, query, options })
      } catch {
        this.pending.delete(id)
        this.fallback.search(query, options).then(resolve, reject)
      }
    })
  }

  importConversations(conversations: Conversation[]) {
    if (!this.worker) return this.fallback.importConversations?.(conversations) ?? Promise.resolve()

    const id = ++this.requestId
    return new Promise<void>((resolve, reject) => {
      this.pending.set(id, { type: 'import', id, conversations, kind: 'import', resolve, reject })
      try {
        this.worker?.postMessage({ type: 'import', id, conversations })
      } catch {
        this.pending.delete(id)
        const importer = this.fallback.importConversations
        if (importer) importer.call(this.fallback, conversations).then(resolve, reject)
        else resolve()
      }
    })
  }
}

export const searchProvider = new WorkerSearchProvider(new MockSemanticSearch(localConversationRepository, '王木木'))
