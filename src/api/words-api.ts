import { COLLECTIONS } from './collections'
import { DbService } from './../services/db-service'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordsApi {
  constructor (private dbService: DbService) {}

  async addWord (word, definition, user, successCallback, errorCallback) {
    return this.dbService.set(COLLECTIONS.WORDS, word,
      {
        user,
        createdAt: Date.now()
      },
      () => {
        this.dbService.set(COLLECTIONS.DEFINITIONS, `${user}-${word}`,
          {
            user,
            word,
            definition,
            createdAt: Date.now()
          },
          successCallback,
          errorCallback
        )
      },
      errorCallback
    )
  }
}
