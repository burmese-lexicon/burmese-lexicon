import { WordsApi } from 'api/words-api'
import { autoinject, bindable } from 'aurelia-framework'

@autoinject
export class WordDefinition {
  @bindable votes: any[]
  @bindable text: string
  @bindable createdAt: number
  @bindable author: any
  @bindable word: string

  constructor (private wordsApi: WordsApi) {}

  vote (num: number) {
    this.wordsApi.vote(this.author.uid, this.word, this.text, num)
  }
}
