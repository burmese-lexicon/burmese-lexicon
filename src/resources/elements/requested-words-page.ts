import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class RequestedWordsPage {
  private words: any[]
  private loading: boolean = true
  private error: string

  constructor (private element: Element, private router: Router, private wordsApi: WordsApi) {
    this.words = []
  }

  async created () {
    try {
      this.words = await this.wordsApi.getRequestedWords()
      this.loading = false
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the words. Please try again later.'
    }
  }
}
