import { COLLECTIONS } from './collections'
import { DbService } from './../services/db-service'
import { UsersApi } from 'api/users-api'
import { autoinject } from 'aurelia-dependency-injection'
import {HttpClient} from 'aurelia-fetch-client'
import APIS from './apis'

@autoinject
export class ContributionsApi {
  constructor (private httpClient: HttpClient, private usersApi: UsersApi, private dbService: DbService) {}

  async getTopContributions () {
    const response = await this.httpClient.fetch(APIS.GET_TOP_CONTRIBUTIONS)
    const contributions = await response.json()
    // TODO: firestore doesn't have query for id array
    const contributors = []
    for (let contribution of contributions) {
      const userSnap = await this.usersApi.getPublicUserInfo(contribution.user)
      const userData = userSnap.data()
      const name = userData.name
      const photoURL = userData.photoURL
      contributors.push({
        user: name,
        photoURL,
        score: contribution.score,
        definitions: contribution.definitions,
        votes: contribution.votes
      })
    }
    return contributors
  }

  async getStats () {
    const snap = await this.dbService.get(COLLECTIONS.STATS, 'stats')
    return snap.data()
  }
}
