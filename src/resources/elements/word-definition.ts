import { AuthRequestedMessage } from './auth-modal'
import { EventAggregator } from 'aurelia-event-aggregator'
import { AuthService } from './../../services/auth-service'
import { WordsApi } from 'api/words-api'
import { autoinject, bindable } from 'aurelia-framework'

@autoinject
export class WordDefinition {
  @bindable votes: any[]
  @bindable text: string
  @bindable createdAt: number
  @bindable author: any
  @bindable word: string

  constructor (private wordsApi: WordsApi, private authService: AuthService, private ea: EventAggregator) {}

  vote (num: number) {
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
    } else {
      this.wordsApi.vote(this.author.uid, this.authService.userId, this.word, this.text, num)
    }
  }
}
