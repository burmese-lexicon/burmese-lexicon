import firebase from '@firebase/app'
import '@firebase/firestore'
import { DocumentData } from '@firebase/firestore-types'

export class DbService {
  private db: any

  configure () {
    this.db = firebase.firestore()
  }

  add (collectionName: string, document: DocumentData, successCallback: Function = () => {}, errorCallback: Function = () => {}) {
    this.db.collection(collectionName).add(document)
      .then(successCallback)
      .catch(errorCallback)
  }

  set (collectionName: string, documentId: string, document: DocumentData, successCallback: Function = () => { }, errorCallback: Function = () => { }) {
    this.db.collection(collectionName).doc(documentId).set(document)
      .then(successCallback)
      .catch(errorCallback)
  }
}
