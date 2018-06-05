import { PrerenderService } from './../../services/prerender-service'
import { autoinject } from 'aurelia-framework'
import { ContributionsApi } from 'api/contributions-api'
import { SocialService } from 'services/social-service'

@autoinject
export class ContributorsPage {
  private loading: boolean = true
  private contributions: any[] = []

  constructor (
    private contributionsApi: ContributionsApi,
    private ps: PrerenderService,
    private ss: SocialService
  ) {}

  async created () {
    try {
      this.contributions = await this.contributionsApi.getTopContributions()
      this.ss.setSocialTags({
        title: 'အများဆုံး အနက်ဖွင့်သူများ',
        description: this.contributions.map(c => c.user).join('၊ '),
        url: window.location.href
      })
      this.ps.setPrerenderReady()
    } catch (e) {
      console.error(e)
      console.error('loading contributions failed')
    } finally {
      this.loading = false
    }
  }
}
