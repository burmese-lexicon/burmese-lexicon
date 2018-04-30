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
}
