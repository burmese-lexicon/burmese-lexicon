import { autoinject } from 'aurelia-framework'
import { WordsApi } from 'api/words-api'

@autoinject
export class WordOfDay {
  private word: string

  constructor (private wordsApi: WordsApi) {}

  async attached () {
    try {
      const words = await this.wordsApi.getWordList()
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 0)
      const diff = Date.now() - start.valueOf()
      const oneDay = 1000 * 60 * 60 * 24
      const day = Math.floor(diff / oneDay)
      this.word = words[day % words.length]
    } catch (e) {
      console.error(e)
    }
  }
}
