import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'
import { SocialService } from 'services/social-service';

@autoinject
export class WordsPage {
  private words: any[]
  private letters: string[] = String.fromCharCode(...[...Array('ဪ'.charCodeAt(0) - 'က'.charCodeAt(0) + 1).keys()].map(i => i + '\u1000'.charCodeAt(0))).split('');
  private loading: boolean = true
  private error: string

  constructor (
    private element: Element,
    private router: Router,
    private wordsApi: WordsApi,
    private ss: SocialService
  ) {
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
    this.ss.setSocialTags({
      title: 'Words',
      description: 'အနက်ဖွင့်ဆိုထားပြိးသော စာလုံးများ',
      url: window.location.href
    })
  }

  scrollToLetter (event: MouseEvent) {
    const letter = (<HTMLElement>event.target).textContent
    const element = document.querySelector(`.start-letter-${letter}`)
    if (element) {
      element.scrollIntoView()
    }
  }
}
