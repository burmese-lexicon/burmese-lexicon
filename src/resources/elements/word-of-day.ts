import { autoinject } from 'aurelia-framework'
import { WordsApi } from 'api/words-api'
import seedrandom from 'seedrandom'

@autoinject
export class WordOfDay {
  private word: string

  constructor (private wordsApi: WordsApi) {}

  async attached () {
    try {
      const words = await this.wordsApi.getWordList()
      const date = new Date()
      const dateString = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`
      const random = seedrandom(dateString)()
      const todayIndex = Math.floor(random * words.length)
      this.word = words[todayIndex]
    } catch (e) {
      console.error(e)
    }
  }
}
