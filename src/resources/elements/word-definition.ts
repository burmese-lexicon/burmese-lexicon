import { AuthRequestedMessage } from './auth-modal'
import { EventAggregator } from 'aurelia-event-aggregator'
import { AuthService } from './../../services/auth-service'
import { WordsApi } from 'api/words-api'
import { autoinject, bindable, computedFrom } from 'aurelia-framework'

@autoinject
export class WordDefinition {
  @bindable private votes: object
  @bindable private text: string
  @bindable private createdAt: number
  @bindable private author: any
  @bindable private word: string
  @bindable private delete: Function
  private index: number

  constructor (private wordsApi: WordsApi, private authService: AuthService, private ea: EventAggregator) {}

  bind (bindingContext: any, overrideContext: any) {
    this.index = overrideContext.$index
  }

  handleDelete () {
    this.delete(this.index)
  }

  async vote (type: 'up' | 'down') {
    if (!this.authService.user) {
      this.ea.publish(new AuthRequestedMessage())
    } else {
      let vote = this.authService.userId in this.votes ? this.votes[this.authService.userId] : 0
      vote = type === 'up' ? ++vote : --vote
      if (vote > 1) {
        vote = 1
      } else if (vote < -1) {
        vote = -1
      }
      try {
        await this.wordsApi.vote(this.authService.userId, this.author.uid, this.word, this.text, vote)
        this.votes = {
          ...this.votes,
          [this.authService.userId]: vote
        }
      } catch (e) {
        console.error('Voting failed.')
      }
    }
  }

  @computedFrom('votes')
  get voteCount () {
    return Object.values(this.votes).reduce((sum, vote) => sum + vote, 0)
  }

  @computedFrom('votes')
  get userVotedUpOrDown () {
    const vote = this.votes[this.authService.userId]
    if (vote > 0) {
      return 'up'
    } else if (vote < 0) {
      return 'down'
    } else {
      return ''
    }
  }
}
