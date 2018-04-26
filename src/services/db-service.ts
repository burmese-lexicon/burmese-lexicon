import firebase from '@firebase/app'
import '@firebase/firestore'
import { DocumentData } from '@firebase/firestore-types'
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants'

export class DbService {
  private db: any

  configure () {
    this.db = firebase.firestore()
  }

  async add (collectionName: string, document: DocumentData) {
    try {
      return await this.db.collection(collectionName).add(document)
    } catch (e) {
      this.logError(e, 'add', collectionName, null, document)
    }
  }

  async set (collectionName: string, documentId: string, document: DocumentData): Promise<any> {
    try {
      return await this.db.collection(collectionName).doc(documentId).set(document)
    } catch (e) {
      this.logError(e, 'set', collectionName, documentId, document)
    }
  }

  async merge (collectionName: string, documentId: string, document: DocumentData): Promise<any> {
    try {
      return await this.db.collection(collectionName).doc(documentId).set(document, {merge: true})
    } catch (e) {
      this.logError(e, 'merge', collectionName, documentId, document)
    }
  }

  async get (collectionName: string, docId: string): Promise<any> {
    try {
      return await this.db.collection(collectionName).doc(docId).get()
    } catch (e) {
      this.logError(e, 'get', collectionName, docId, null)
    }
  }

  async searchText (collectionName: string, text: string): Promise<any> {
    try {
      return await this.db.collection(collectionName)
        .where('text', '==', text)
        .get()
    } catch (e) {
      this.logError(e, 'searchText', collectionName, text)
    }
  }

  async delete (collectionName: string, docId: string): Promise<any> {
    try {
      return await this.db.collection(collectionName).doc(docId).delete()
    } catch (e) {
      this.logError(e, 'delete', collectionName, docId, null)
    }
  }

  async getAll (collectionName: string): Promise<any> {
    try {
      return await this.db.collection(collectionName).get()
    } catch (e) {
      this.logError(e, 'getAll', collectionName, null, null)
    }
  }

  async getWhere (collectionName: string, whereClause: any[]): Promise<any> {
    try {
      return await this.db.collection(collectionName).where(...whereClause).get()
    } catch (e) {
      this.logError(e, 'getWhere', collectionName, null, document)
    }
  }

  private logError (error, operation, collectionName, documentId?, document?) {
    console.error('db operation failed for', operation, collectionName, documentId, document)
    console.error(error)
    throw error
  }
}
