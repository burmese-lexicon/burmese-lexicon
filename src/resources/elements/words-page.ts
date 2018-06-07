import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'
import { SocialService } from 'services/social-service';
import { PrerenderService } from 'services/prerender-service';

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
    private ss: SocialService,
    private ps: PrerenderService
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
      this.ss.setSocialTags({
        title: 'အနက်ဖွင့်ဆိုထားပြိးသော စာလုံးများ',
        description: this.words.slice(0, 50).map(word => word.id).join('၊ '),
        url: window.location.href
      })
      this.ps.setPrerenderReady()
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the words. Please try again later.'
    }
  }

  scrollToLetter (event: MouseEvent) {
    const letter = (<HTMLElement>event.target).textContent
    const element = document.querySelector(`.start-letter-${letter}`)
    if (element) {
      element.scrollIntoView()
    }
  }
}
