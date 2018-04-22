import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class WordsPage {
  private words: any[]
  private loading: boolean = true
  private error: string

  constructor (private element: Element, private router: Router, private wordsApi: WordsApi) {
    this.words = []
  }

  async created () {
    try {
      const wordsQuerySnapshot = await this.wordsApi.getWords()
      const words = []
      wordsQuerySnapshot.forEach(word => {
        words.push({
          id: word.id,
          ...word.data()
        })
      })
      this.words = words
      this.loading = false
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the words. Please try again later.'
    }
  }

  attached () {
    const id = `word-list-${Date.now()}`
    this.element.querySelector('.word-list-segment').id = id
    jQuery(this.element).find('.ui.sticky').sticky({
      context: `#${id}`
    })
  }
}
