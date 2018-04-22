import { COLLECTIONS } from './collections'
import { DbService } from './../services/db-service'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordsApi {
  constructor (private dbService: DbService) {}

  async addWord (word, definition, user) {
    await this.dbService.set(COLLECTIONS.WORDS, word,
      {
        user,
        createdAt: Date.now()
      }
    )
    await this.dbService.set(COLLECTIONS.DEFINITIONS, `${user}-${word}`,
      {
        user,
        word,
        text: definition,
        createdAt: Date.now()
      }
    )
  }

  getWords () {
    return this.dbService.getAll(COLLECTIONS.WORDS)
  }

  getDefinitionsForWord (word: string) {
    return this.dbService.getWhere(COLLECTIONS.DEFINITIONS, ['word', '==', word])
  }

  vote (user, word, definition, vote) {
    return this.dbService.set(COLLECTIONS.DEFINITIONS, this.generateDefinitionId(user, word),
      {
        votes: {
          [user]: vote > 0 ? 1 : -1
        }
      }
    )
  }

  generateDefinitionId (user, word) {
    return `${user}-${word}`
  }
}
