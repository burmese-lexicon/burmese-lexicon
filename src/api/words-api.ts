import { COLLECTIONS } from './collections'
import { DbService } from './../services/db-service'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordsApi {
  constructor (private dbService: DbService) {}

  addWord (id, word) {
    this.dbService.set(COLLECTIONS.WORDS, id, word)
  }
}
