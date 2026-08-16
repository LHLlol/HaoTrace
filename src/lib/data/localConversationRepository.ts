import type { Conversation } from '../../types/conversation'
import type { ConversationRepository } from './conversationRepository'
import { mockConversationRepository } from './mockConversationRepository'

interface ImportedConversationPayload {
  version: number
  primarySpeaker: string
  importedMessageCount: number
  importedAtRange: { start: string; end: string }
  conversations: Conversation[]
}

let conversationsPromise: Promise<Conversation[]> | undefined

async function loadImportedConversations() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/haotrace-conversations.json`)
  if (!response.ok) throw new Error(`Unable to load imported conversations (${response.status})`)

  const payload = await response.json() as ImportedConversationPayload
  return payload.conversations
}

export const localConversationRepository: ConversationRepository = {
  async listConversations() {
    conversationsPromise ??= loadImportedConversations().catch(async (error) => {
      console.warn('Falling back to demo conversations:', error)
      return mockConversationRepository.listConversations()
    })
    return conversationsPromise
  },
  async getConversation(id) {
    const conversations = await this.listConversations()
    return conversations.find((conversation) => conversation.id === id)
  },
}
