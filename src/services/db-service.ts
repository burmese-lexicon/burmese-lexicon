import firebase from '@firebase/app'
import '@firebase/firestore'
import { DocumentData } from '@firebase/firestore-types'

export class DbService {
  private db: any

  configure () {
    this.db = firebase.firestore()
  }

  add (collectionName: string, document: DocumentData, successCallback: Function, errorCallback: Function) {
    return this.db.collection(collectionName).add(document)
      .then(() => {
        if (typeof successCallback === 'function') {
          successCallback()
        }
      })
      .catch(error => {
        console.log(error)
        if (typeof errorCallback === 'function') {
          errorCallback(error)
        }
      })
  }

  set (collectionName: string, documentId: string, document: DocumentData, successCallback: Function, errorCallback: Function) {
    return this.db.collection(collectionName).doc(documentId).set(document)
      .then(() => {
        if (typeof successCallback === 'function') {
          successCallback()
        }
      })
      .catch(error => {
        console.error('Failed setting', collectionName, documentId, document)
        console.error(error)
        if (typeof errorCallback === 'function') {
          errorCallback(error)
        }
      })
  }
}
