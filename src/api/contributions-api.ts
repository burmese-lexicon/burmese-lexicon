import { COLLECTIONS } from './collections'
import { DbService } from './../services/db-service'
import { UsersApi } from 'api/users-api'
import { autoinject } from 'aurelia-dependency-injection'
import APIS from './apis'

@autoinject
export class ContributionsApi {
  constructor (private usersApi: UsersApi, private dbService: DbService) {}

  async getTopContributions () {
    const snap = await this.dbService.getAll(COLLECTIONS.CONTRIBUTIONS, {
      orderBy: ['score', 'desc'],
      limit: 100
    })
    const contributors = []
    snap.forEach(async s => {
      const contribution = s.data()
      contributors.push({
        user: contribution.name,
        photoURL: contribution.photoURL,
        score: contribution.score,
        definitions: contribution.definitions,
        votes: contribution.votes
      })
    })
    return contributors
  }

  async getStats () {
    const snap = await this.dbService.get(COLLECTIONS.STATS, 'stats')
    return snap.data()
  }
}
