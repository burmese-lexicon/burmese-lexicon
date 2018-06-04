import { DbService } from './../services/db-service'
import { autoinject } from 'aurelia-dependency-injection'
import { COLLECTIONS } from './collections'

@autoinject
export class UsersApi {
  constructor (private dbService: DbService) {}

  getPublicUserInfo (userId: string) {
    return this.dbService.get(COLLECTIONS.PUBLIC_USERS, userId)
  }

  setPublicUserInfo (userId: string, user: any) {
    return this.dbService.merge(COLLECTIONS.PUBLIC_USERS, userId, user)
  }

  async getUserRoles (userId: string) {
    let userSnap
    try {
      userSnap = await this.dbService.get(COLLECTIONS.USERS, userId)
    } catch (e) {
      console.warn('error fetching user roles for first user creation, returned []')
      return []
    }
    if (!userSnap.exists) {
      return []
    }
    const userData = userSnap.data()
    return userData.roles ? userData.roles : []
  }
}
