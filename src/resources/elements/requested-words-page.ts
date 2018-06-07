import { PrerenderService } from 'services/prerender-service'
import { SocialService } from 'services/social-service'
import { WordsApi } from './../../api/words-api'
import { Router } from 'aurelia-router'
import { autoinject } from 'aurelia-dependency-injection'

@autoinject
export class RequestedWordsPage {
  private words: any[]
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
      this.words = await this.wordsApi.getRequestedWords()
      this.loading = false
      this.ss.setSocialTags({
        title: 'Requested Words | Do you know the meaning of these words? Contribute here!',
        description: this.words.join('၊ '),
        url: window.location.href
      })
      this.ps.setPrerenderReady()
    } catch (e) {
      console.error(e)
      this.error = 'There was an error fetching the words. Please try again later.'
    }
  }
}
