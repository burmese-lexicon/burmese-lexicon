import { AuthRequestedMessage } from './auth-modal'
import { EventAggregator } from 'aurelia-event-aggregator'
import { AuthService } from './../../services/auth-service'
import { WordsApi } from 'api/words-api'
import { autoinject, bindable } from 'aurelia-framework'

@autoinject
export class WordDefinition {
  @bindable private votes: number
  @bindable private text: string
  @bindable private createdAt: number
  @bindable private author: any
  @bindable private word: string

  constructor (private wordsApi: WordsApi, private authService: AuthService, private ea: EventAggregator) {}

  async vote (num: number) {
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
    } else {
      try {
        await this.wordsApi.vote(this.authService.userId, this.author.uid, this.word, this.text, num)
        this.votes++
      } catch (e) {
        console.error('Voting failed.')
      }
    }
  }
}
