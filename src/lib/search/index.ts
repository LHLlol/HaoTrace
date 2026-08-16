import { localConversationRepository } from '../data/localConversationRepository'
import { MockSemanticSearch } from './mockSemanticSearch'

export const searchProvider = new MockSemanticSearch(localConversationRepository, '王木木')
