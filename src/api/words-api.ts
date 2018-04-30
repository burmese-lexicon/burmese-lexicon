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
        text: word,
        createdAt: Date.now()
      }
    )
    await this.dbService.set(COLLECTIONS.DEFINITIONS, this.generateDefinitionId(user, word),
      {
        user,
        word,
        text: definition,
        createdAt: Date.now()
      }
    )
  }

  getWord (word: string) {
    return this.dbService.get(COLLECTIONS.WORDS, word)
  }

  deleteDefinition (definition: string) {
    return this.dbService.delete(COLLECTIONS.DEFINITIONS, definition)
  }

  addDefinition (word: string, definition: string, user: string) {
    return this.dbService.set(COLLECTIONS.DEFINITIONS, this.generateDefinitionId(user, word), {
      user,
      text: definition,
      createdAt: Date.now(),
      word
    })
  }

  updateDefinition (word: string, definition: string, user: string) {
    return this.dbService.merge(COLLECTIONS.DEFINITIONS, this.generateDefinitionId(user, word), {
      user,
      text: definition,
      createdAt: Date.now(),
      word
    })
  }

  getWords () {
    return this.dbService.getAll(COLLECTIONS.WORDS, 'text', 100)
  }

  async searchSimilarWords (word: string) {
    const snapshot = await this.dbService.searchText(COLLECTIONS.WORDS, word)
    const words = []
    snapshot.forEach(doc => words.push(doc.id))
    return words
  }

  async getWordList () {
    /*
      TODO:
      save money on full text search by just storing all words in a list
      and return that list for client-side fuzzy search since it'll be less than 1 MB
      for a long time.
      The list is updated via cloud function trigger on word creation
    */
    const snapshot = await this.dbService.get(COLLECTIONS.WORD_LIST, 'static')
    return snapshot.data().words
  }

  getDefinitionsForWord (word: string) {
    return this.dbService.getWhere(COLLECTIONS.DEFINITIONS, ['word', '==', word])
  }

  vote (user, author, word, definition, vote) {
    return this.dbService.merge(COLLECTIONS.DEFINITIONS, this.generateDefinitionId(author, word),
      {
        votes: {
          [user]: vote
        }
      }
    )
  }

  generateDefinitionId (user, word) {
    return `${user}-${word}`
  }
}
