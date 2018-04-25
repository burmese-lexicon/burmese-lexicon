import { autoinject } from 'aurelia-dependency-injection'
import {HttpClient} from 'aurelia-fetch-client'
import APIS from './apis'

@autoinject
export class ContributionsApi {
  constructor (private httpClient: HttpClient) {}

  async getTopContributions () {
    const response = await this.httpClient.fetch(APIS.GET_TOP_CONTRIBUTIONS)
    const contributions = await response.json()
    return contributions
  }
}
