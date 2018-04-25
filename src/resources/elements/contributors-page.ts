import { autoinject } from 'aurelia-framework'
import { ContributionsApi } from 'api/contributions-api'

@autoinject
export class ContributorsPage {
  private loading: boolean = true
  private contributions: any[] = []

  constructor (private contributionsApi: ContributionsApi) {}

  async created () {
    try {
      this.contributions = await this.contributionsApi.getTopContributions()
    } catch (e) {
      console.error('loading contributions failed')
    } finally {
      this.loading = false
    }
  }
}
