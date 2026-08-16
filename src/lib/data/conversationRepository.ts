import type { Conversation } from '../../types/conversation'

export interface ConversationRepository {
  listConversations(): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | undefined>
}
