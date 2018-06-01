import { ContributionsApi } from './../../api/contributions-api'
import { autoinject, bindable } from 'aurelia-framework'
import { NotiService } from 'services/noti-service'
import { SocialService } from 'services/social-service'

@autoinject
export class HomePage {
  private loading: boolean = true
  private error: boolean
  private stats: object
  @bindable private wotd: string

  constructor (
    private contributionsApi: ContributionsApi,
    private notiService: NotiService,
    private ss: SocialService
  ) {}

  async created () {
    try {
      this.stats = await this.contributionsApi.getStats()
    } catch (e) {
      this.error = true
      console.error(e)
    } finally {
      this.loading = false
    }
  }

  activate () {
    this.updateMetaTags()
  }

  wotdChanged () {
    this.updateMetaTags()
  }

  updateMetaTags () {
    this.ss.setSocialTags({
      title: 'Word of the day',
      description: this.wotd,
      url: `${window.location.href}words/${this.wotd}`
    })
  }
}
