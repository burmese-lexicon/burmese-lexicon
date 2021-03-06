import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'
import { SocialService } from 'services/social-service';
import { PrerenderService } from 'services/prerender-service';

const numOfBurmeseLetters = Array.from(Array('ဪ'.charCodeAt(0) - 'က'.charCodeAt(0) + 1).keys());

@autoinject
export class WordsPage {
  private words: any[]
  private letters: string[] = Array.from(numOfBurmeseLetters).map(i => String.fromCharCode(i + '\u1000'.charCodeAt(0)));
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
      this.words = await this.wordsApi.getWordList()
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
